export function priceYes(qYes: number, qNo: number, b = 10) {
  const ey = Math.exp(qYes / b);
  const en = Math.exp(qNo / b);
  return ey / (ey + en);
}

export function cost(qYes: number, qNo: number, b = 10) {
  return b * Math.log(Math.exp(qYes / b) + Math.exp(qNo / b));
}

export function costToBuyDeltaYes(qYes: number, qNo: number, deltaYes: number, b = 10) {
  const before = cost(qYes, qNo, b);
  const after = cost(qYes + deltaYes, qNo, b);
  return after - before;
}

export function costToBuyDeltaNo(qYes: number, qNo: number, deltaNo: number, b = 10) {
  const before = cost(qYes, qNo, b);
  const after = cost(qYes, qNo + deltaNo, b);
  return after - before;
}

export function priceNo(qYes: number, qNo: number, b = 10) {
  const ey = Math.exp(qYes / b);
  const en = Math.exp(qNo / b);
  return en / (ey + en);
}

export function findQuantityForExactCost(qYes: number, qNo: number, cash: number, b = 10, tradeType: 'yes' | 'no' = 'yes') {
  // Find delta such that costToBuyDelta(qYes,qNo,delta) = cash
  // Use binary search. Allow negative? only positive buys.
  const maxIter = 60;
  let low = 0;
  let high = Math.max(1, cash * 2 + 10);
  const costFn = tradeType === 'yes' 
    ? (delta: number) => costToBuyDeltaYes(qYes, qNo, delta, b)
    : (delta: number) => costToBuyDeltaNo(qYes, qNo, delta, b);
  for (let i = 0; i < maxIter; i++) {
    const mid = (low + high) / 2;
    const c = costFn(mid);
    if (c > cash) high = mid;
    else low = mid;
  }
  return low;
}
