"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceYes = priceYes;
exports.cost = cost;
exports.costToBuyDeltaYes = costToBuyDeltaYes;
exports.costToBuyDeltaNo = costToBuyDeltaNo;
exports.priceNo = priceNo;
exports.findQuantityForExactCost = findQuantityForExactCost;
function priceYes(qYes, qNo, b = 10) {
    const ey = Math.exp(qYes / b);
    const en = Math.exp(qNo / b);
    return ey / (ey + en);
}
function cost(qYes, qNo, b = 10) {
    return b * Math.log(Math.exp(qYes / b) + Math.exp(qNo / b));
}
function costToBuyDeltaYes(qYes, qNo, deltaYes, b = 10) {
    const before = cost(qYes, qNo, b);
    const after = cost(qYes + deltaYes, qNo, b);
    return after - before;
}
function costToBuyDeltaNo(qYes, qNo, deltaNo, b = 10) {
    const before = cost(qYes, qNo, b);
    const after = cost(qYes, qNo + deltaNo, b);
    return after - before;
}
function priceNo(qYes, qNo, b = 10) {
    const ey = Math.exp(qYes / b);
    const en = Math.exp(qNo / b);
    return en / (ey + en);
}
function findQuantityForExactCost(qYes, qNo, cash, b = 10, tradeType = 'yes') {
    // Find delta such that costToBuyDelta(qYes,qNo,delta) = cash
    // Use binary search. Allow negative? only positive buys.
    const maxIter = 60;
    let low = 0;
    let high = Math.max(1, cash * 2 + 10);
    const costFn = tradeType === 'yes'
        ? (delta) => costToBuyDeltaYes(qYes, qNo, delta, b)
        : (delta) => costToBuyDeltaNo(qYes, qNo, delta, b);
    for (let i = 0; i < maxIter; i++) {
        const mid = (low + high) / 2;
        const c = costFn(mid);
        if (c > cash)
            high = mid;
        else
            low = mid;
    }
    return low;
}
