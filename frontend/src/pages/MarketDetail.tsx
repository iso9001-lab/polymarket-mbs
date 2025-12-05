import React from 'react'
import TradeForm from '../components/TradeForm'

export default function MarketDetail({ id, onBack, onTrade }: { id: string; onBack: () => void; onTrade: (cost: number) => void }) {
  const [market, setMarket] = React.useState<any | null>(null);
  const [priceYes, setPriceYes] = React.useState<number | null>(null);
  const [priceNo, setPriceNo] = React.useState<number | null>(null);
  const [balance, setBalance] = React.useState<number>(Number(localStorage.getItem('balance') || 1000));
  const [userPosition, setUserPosition] = React.useState<{ yesShares: number; noShares: number } | null>(null);
  const [remainingAllowance, setRemainingAllowance] = React.useState<number | null>(null);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const userId = localStorage.getItem('userId');

  React.useEffect(() => {
    fetch(`/api/markets/${id}`)
      .then(r => r.json())
      .then(setMarket);
    fetch(`/api/markets/${id}/price`).then(r => r.json()).then(d => {
      setPriceYes(d.priceYes);
      setPriceNo(d.priceNo);
    });

    // Check if user is admin
    const adminFlag = localStorage.getItem('isAdmin');
    setIsAdmin(adminFlag === 'true');

    // Fetch user position if logged in
    if (userId) {
      fetch('/api/me/positions', {
        headers: { 'x-user-id': userId }
      })
        .then(r => r.json())
        .then(data => {
          const pos = data.positions?.find((p: any) => p.marketId === id);
          if (pos) {
            setUserPosition({
              yesShares: pos.yesShares,
              noShares: pos.noShares
            });
          }
        })
        .catch(err => console.error('Failed to fetch position:', err));

      // Fetch remaining allowance for this market
      fetch(`/api/markets/${id}/allowance`, { headers: { 'x-user-id': userId } })
        .then(r => r.json())
        .then(d => {
          if (d && typeof d.remainingAllowance === 'number') setRemainingAllowance(d.remainingAllowance);
        })
        .catch(err => console.error('Failed to fetch allowance:', err));
    }
  }, [id, userId]);

  async function resolveMarket(result: 'YES' | 'NO') {
    if (!userId) {
      alert('Not logged in');
      return;
    }
    const endpoint = result === 'YES'
      ? `/api/admin/markets/${id}/resolveYes`
      : `/api/admin/markets/${id}/resolveNo`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`Error: ${data.error || 'Failed to resolve market'}`);
      return;
    }
    alert(`Market resolved as ${result}`);
    // Refresh market
    fetch(`/api/markets/${id}`).then(r => r.json()).then(setMarket);
  }

  if (!market) return <div>Loading...</div>

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h3>{market.title}</h3>
      <div>{market.description}</div>
      <div style={{ marginTop: 8 }}><strong>Price (Yes):</strong> {priceYes ?? '...'}</div>
      <div style={{ marginTop: 8 }}><strong>Price (No):</strong> {priceNo ?? '...'}</div>

      {market.status === 'resolved' && (
        <div style={{ marginTop: 12, padding: 12, backgroundColor: '#fffacd', border: '2px solid #ffd700', borderRadius: 4 }}>
          <strong style={{ color: '#b8860b' }}>🔒 Market Resolved</strong>
          <div style={{ color: '#b8860b' }}>Result: <strong>{market.result}</strong></div>
        </div>
      )}

      {userPosition && (
        <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
          <strong>Your Position:</strong> {userPosition.yesShares.toFixed(2)} YES, {userPosition.noShares.toFixed(2)} NO
        </div>
      )}

      {isAdmin && market.status !== 'resolved' && (
        <div style={{ marginTop: 12, padding: 8, backgroundColor: '#e8f5e9', borderRadius: 4 }}>
          <strong>Admin Actions:</strong>
          <div style={{ marginTop: 8 }}>
            <button onClick={() => resolveMarket('YES')} style={{ marginRight: 8, padding: '6px 12px' }}>
              Resolve YES
            </button>
            <button onClick={() => resolveMarket('NO')} style={{ padding: '6px 12px' }}>
              Resolve NO
            </button>
          </div>
        </div>
      )}

      {market.status !== 'resolved' && (
        <div style={{ marginTop: 12 }}>
          <TradeForm market={market} balance={balance} userId={userId} remainingAllowance={remainingAllowance} onTraded={(res) => {
            // refresh market and deduct from user balance
            fetch(`/api/markets/${id}`).then(r => r.json()).then(setMarket);
            fetch(`/api/markets/${id}/price`).then(r => r.json()).then(d => {
              setPriceYes(d.priceYes);
              setPriceNo(d.priceNo);
            });
            
            // Update position
            if (res.user && res.user.positions) {
              const pos = res.user.positions[id];
              if (pos) {
                setUserPosition({
                  yesShares: pos.yesShares,
                  noShares: pos.noShares
                });
              }
            }

            // Update remaining allowance (subtract cost if provided) - fall back to re-fetch
            if (typeof res.trade?.cost === 'number') {
              setRemainingAllowance(prev => prev !== null ? Math.max(0, prev - res.trade.cost) : null);
            } else {
              fetch(`/api/markets/${id}/allowance`, { headers: { 'x-user-id': userId } })
                .then(r => r.json())
                .then(d => { if (d && typeof d.remainingAllowance === 'number') setRemainingAllowance(d.remainingAllowance); })
                .catch(() => {});
            }
            
            setBalance(balance - res.trade.cost);
            onTrade(res.trade.cost);
            alert('Trade executed: ' + JSON.stringify(res.trade));
          }} />
        </div>
      )}
    </div>
  )
}
