import React from 'react'

interface PortfolioPosition {
  marketId: string;
  title: string;
  yesShares: number;
  noShares: number;
  currentYesPrice: number;
  currentNoPrice: number;
}

export default function Portfolio({ onBack }: { onBack?: () => void }) {
  const [positions, setPositions] = React.useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [balance, setBalance] = React.useState(0);

  React.useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch('/api/me/positions', {
      headers: { 'x-user-id': userId }
    })
      .then(r => r.json())
      .then(data => {
        setPositions(data.positions || []);
        setBalance(data.user.balance);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  const activePositions = positions.filter(p => p.yesShares > 0 || p.noShares > 0);

  return (
    <div>
      {onBack && <button onClick={onBack} style={{ marginBottom: 12 }}>Back</button>}
      <h3>Your Portfolio</h3>
      <div style={{ marginBottom: 12 }}>
        <strong>Balance: ${balance.toFixed(2)}</strong>
      </div>

      {activePositions.length === 0 ? (
        <div style={{ color: '#666' }}>No active positions</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Market</th>
              <th style={{ padding: 8 }}>YES Shares</th>
              <th style={{ padding: 8 }}>YES Price</th>
              <th style={{ padding: 8 }}>NO Shares</th>
              <th style={{ padding: 8 }}>NO Price</th>
            </tr>
          </thead>
          <tbody>
            {activePositions.map(pos => (
              <tr key={pos.marketId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{pos.title}</td>
                <td style={{ padding: 8 }}>{pos.yesShares > 0 ? pos.yesShares.toFixed(2) : '-'}</td>
                <td style={{ padding: 8 }}>${pos.currentYesPrice.toFixed(4)}</td>
                <td style={{ padding: 8 }}>{pos.noShares > 0 ? pos.noShares.toFixed(2) : '-'}</td>
                <td style={{ padding: 8 }}>${pos.currentNoPrice.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
