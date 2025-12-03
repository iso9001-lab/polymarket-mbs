import React from 'react'
import { costToBuyDeltaYes } from '../utils/lmsr'

export default function TradeForm({ market, balance, onTraded }: { market: any; balance: number; onTraded: (res: any) => void }) {
  const [deltaYes, setDeltaYes] = React.useState<number>(0);
  const [cost, setCost] = React.useState<number | ''>('');

  const estimatedCostDelta = deltaYes > 0 ? costToBuyDeltaYes(market.qYes, market.qNo, deltaYes, market.b) : 0;
  const canAffordDelta = estimatedCostDelta <= balance;
  const canAffordCost = (cost as any) === '' || (Number(cost) <= balance);

  async function buyByDelta(e: any) {
    e.preventDefault();
    if (!canAffordDelta) { alert('Insufficient balance for this trade'); return; }
    const body: any = { deltaYes: Number(deltaYes) };
    const res = await fetch(`/api/markets/${market.id}/buy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { alert(JSON.stringify(data)); return; }
    onTraded(data);
  }

  async function buyByCost(e: any) {
    e.preventDefault();
    if (!canAffordCost) { alert('Insufficient balance for this trade'); return; }
    const body: any = { cost: Number(cost) };
    const res = await fetch(`/api/markets/${market.id}/buy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { alert(JSON.stringify(data)); return; }
    onTraded(data);
  }

  return (
    <div>
      <form onSubmit={buyByDelta} style={{ marginBottom: 12 }}>
        <div>
          <label>Buy delta Yes:</label>
          <input type="number" value={deltaYes} onChange={e => setDeltaYes(Number(e.target.value))} />
          <span style={{ marginLeft: 8, fontSize: 12, color: canAffordDelta ? 'green' : 'red' }}>
            Est. cost: ${estimatedCostDelta.toFixed(2)}
          </span>
          <button type="submit" disabled={!canAffordDelta}>Buy</button>
        </div>
      </form>
      <form onSubmit={buyByCost}>
        <div>
          <label>Spend exact cost:</label>
          <input type="number" value={cost as any} onChange={e => setCost(e.target.value === '' ? '' : Number(e.target.value))} />
          <button type="submit" disabled={!canAffordCost}>Buy by cost</button>
        </div>
      </form>
    </div>
  )
}
