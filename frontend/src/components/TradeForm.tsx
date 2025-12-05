import React from 'react'
import { costToBuyDeltaYes, costToBuyDeltaNo } from '../utils/lmsr'

export default function TradeForm({ market, balance, userId, remainingAllowance, onTraded }: { market: any; balance: number; userId: string | null; remainingAllowance?: number | null; onTraded: (res: any) => void }) {
  const [tradeType, setTradeType] = React.useState<'yes' | 'no'>('yes');
  const [deltaYes, setDeltaYes] = React.useState<number>(0);
  const [deltaNo, setDeltaNo] = React.useState<number>(0);
  const [cost, setCost] = React.useState<number | ''>('');

  const delta = tradeType === 'yes' ? deltaYes : deltaNo;
  const MAX_SHARES_PER_TRADE = 10;
  const MAX_COST_PER_MARKET = 100;
  const estimatedCostDelta = delta > 0 
    ? (tradeType === 'yes' 
      ? costToBuyDeltaYes(market.qYes, market.qNo, delta, market.b)
      : costToBuyDeltaNo(market.qYes, market.qNo, delta, market.b))
    : 0;

  // remaining allowance may be null/undefined when not logged in
  const remaining = typeof remainingAllowance === 'number' ? remainingAllowance : MAX_COST_PER_MARKET;

  const canAffordDelta = delta > 0 && delta <= MAX_SHARES_PER_TRADE && estimatedCostDelta <= balance && estimatedCostDelta <= remaining;
  const canAffordCost = (cost as any) === '' || (Number(cost) > 0 && Number(cost) <= MAX_COST_PER_MARKET && Number(cost) <= balance && Number(cost) <= remaining);

  async function buyByDelta(e: any) {
    e.preventDefault();
    const delta = tradeType === 'yes' ? deltaYes : deltaNo;
    if (delta <= 0) { alert('Delta must be positive'); return; }
    if (delta > MAX_SHARES_PER_TRADE) { alert(`Maximum ${MAX_SHARES_PER_TRADE} shares per trade`); return; }
    if (estimatedCostDelta > remaining) { alert(`This trade would exceed your remaining allowance of $${remaining.toFixed(2)} on this market`); return; }
    if (!canAffordDelta) { alert('Insufficient balance or allowance for this trade'); return; }
    const body: any = tradeType === 'yes' 
      ? { deltaYes: delta }
      : { deltaNo: delta };
    if (userId) {
      body.userId = userId;
    }
    const res = await fetch(`/api/markets/${market.id}/buy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { alert(JSON.stringify(data)); return; }
    onTraded(data);
  }

  async function buyByCost(e: any) {
    e.preventDefault();
    const costValue = Number(cost);
    if (costValue <= 0) { alert('Cost must be positive'); return; }
    if (costValue > MAX_COST_PER_MARKET) { alert(`Maximum $${MAX_COST_PER_MARKET} per market`); return; }
    if (costValue > remaining) { alert(`This trade would exceed your remaining allowance of $${remaining.toFixed(2)} on this market`); return; }
    if (!canAffordCost) { alert('Insufficient balance or allowance for this trade'); return; }
    const body: any = { cost: costValue, tradeType };
    if (userId) {
      body.userId = userId;
    }
    const res = await fetch(`/api/markets/${market.id}/buy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { alert(JSON.stringify(data)); return; }
    onTraded(data);
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label>Trade Type:</label>
        <select value={tradeType} onChange={e => setTradeType(e.target.value as 'yes' | 'no')} style={{ marginLeft: 8 }}>
          <option value="yes">YES</option>
          <option value="no">NO</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <strong>Remaining allowance:</strong> ${remaining.toFixed(2)}
      </div>

      <form onSubmit={buyByDelta} style={{ marginBottom: 12 }}>
        <div>
          <label>Buy delta {tradeType.toUpperCase()} (max {MAX_SHARES_PER_TRADE}):</label>
          <input 
            type="number" 
            value={tradeType === 'yes' ? deltaYes : deltaNo} 
            onChange={e => tradeType === 'yes' ? setDeltaYes(Number(e.target.value)) : setDeltaNo(Number(e.target.value))} 
          />
          <span style={{ marginLeft: 8, fontSize: 12, color: canAffordDelta ? 'green' : 'red' }}>
            Est. cost: ${estimatedCostDelta.toFixed(2)}
          </span>
          <button type="submit" disabled={!canAffordDelta}>Buy</button>
        </div>
      </form>
      <form onSubmit={buyByCost}>
        <div>
          <label>Spend exact cost (max ${MAX_COST_PER_MARKET}):</label>
          <input type="number" value={cost as any} onChange={e => setCost(e.target.value === '' ? '' : Number(e.target.value))} />
          <button type="submit" disabled={!canAffordCost}>Buy by cost</button>
        </div>
      </form>
    </div>
  )
}
