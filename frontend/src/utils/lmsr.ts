export function cost(qYes: number, qNo: number, b = 10) {
  return b * Math.log(Math.exp(qYes / b) + Math.exp(qNo / b));
}

export function costToBuyDeltaYes(qYes: number, qNo: number, deltaYes: number, b = 10) {
  const before = cost(qYes, qNo, b);
  const after = cost(qYes + deltaYes, qNo, b);
  return after - before;
}
