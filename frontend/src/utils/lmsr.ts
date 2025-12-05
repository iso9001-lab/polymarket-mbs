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

export function priceYes(qYes: number, qNo: number, b = 10) {
  const ey = Math.exp(qYes / b);
  const en = Math.exp(qNo / b);
  return ey / (ey + en);
}

export function priceNo(qYes: number, qNo: number, b = 10) {
  return 1 - priceYes(qYes, qNo, b);
}
