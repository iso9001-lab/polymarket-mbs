import React from 'react'
import TradeForm from '../components/TradeForm'

export default function MarketDetail({ id, onBack, onTrade }: { id: string; onBack: () => void; onTrade: (cost: number) => void }) {
  const [market, setMarket] = React.useState<any | null>(null);
  const [price, setPrice] = React.useState<number | null>(null);
  const [balance, setBalance] = React.useState<number>(Number(localStorage.getItem('balance') || 1000));

  React.useEffect(() => {
    fetch(`/api/markets/${id}`)
      .then(r => r.json())
      .then(setMarket);
    fetch(`/api/markets/${id}/price`).then(r => r.json()).then(d => setPrice(d.priceYes));
  }, [id]);

  if (!market) return <div>Loading...</div>

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h3>{market.title}</h3>
      <div>{market.description}</div>
      <div style={{ marginTop: 8 }}><strong>Price (Yes):</strong> {price ?? '...'}</div>
      <div style={{ marginTop: 12 }}>
        <TradeForm market={market} balance={balance} onTraded={(res) => {
          // refresh market and deduct from user balance
          fetch(`/api/markets/${id}`).then(r => r.json()).then(setMarket);
          fetch(`/api/markets/${id}/price`).then(r => r.json()).then(d => setPrice(d.priceYes));
          setBalance(balance - res.trade.cost);
          onTrade(res.trade.cost);
          alert('Trade executed: ' + JSON.stringify(res.trade));
        }} />
      </div>
    </div>
  )
}
