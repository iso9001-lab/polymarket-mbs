# Portfolio System - Testing Guide

## Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:4000

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Test Scenarios

### Test 1: Register & Login

**Steps:**
1. Click "Register" button
2. Enter username: "testuser" password: "password123"
3. Should see alert "Logged in" (after successful register → auto-login)
4. Verify Portfolio button appears in header
5. Verify balance shows $1000.00

**Expected:**
- User created with balance: 1000 and empty positions
- UI shows Portfolio button and logout option
- Balance displayed correctly

---

### Test 2: View Portfolio (Empty)

**Steps:**
1. Ensure logged in (from Test 1)
2. Click "Portfolio" button
3. Should see "No active positions"

**Expected:**
- Portfolio page loads
- Message: "No active positions"
- Balance shown as $1000.00

---

### Test 3: Buy YES Shares

**Steps:**
1. Click "Markets" → Open a market
2. See "Your Position: 0.00 YES, 0.00 NO"
3. Under "Buy delta YES (max 10)":
   - Enter 5
   - Click "Buy"
4. Should see alert with trade details
5. Position should update to "5.00 YES, 0.00 NO"
6. Balance should decrease

**Expected:**
- Trade executes successfully
- Position updates immediately
- Balance reduced by cost
- MarketDetail shows updated position

---

### Test 4: Buy NO Shares

**Steps:**
1. Still on market detail page
2. Change Trade Type dropdown to "NO"
3. Enter 3 in delta input
4. Click "Buy"
5. Position should update to "5.00 YES, 3.00 NO"

**Expected:**
- NO trade executes
- Position shows both YES and NO holdings
- Total cost reflected in balance

---

### Test 5: View Full Portfolio

**Steps:**
1. Click "Portfolio" button in header
2. Should see market with:
   - Market title
   - 5.00 YES shares
   - Current YES price (e.g., 0.7321)
   - 3.00 NO shares
   - Current NO price (e.g., 0.2679)

**Expected:**
- Table displays market
- Prices shown with 4 decimal places
- YES price + NO price ≈ 1.0

---

### Test 6: Max Shares Validation

**Steps:**
1. On market detail
2. Try to enter 11 in delta field
3. Click "Buy"

**Expected:**
- Alert: "Maximum 10 shares per trade"
- Trade does not execute
- Portfolio unchanged

---

### Test 7: Max Cost Validation

**Steps:**
1. On market detail
2. Select "Spend exact cost" mode
3. Try to enter 101
4. Click "Buy by cost"

**Expected:**
- Alert: "Maximum $100 per market"
- Trade does not execute

---

### Test 8: Cumulative Market Limit

**Steps:**
1. On market detail
2. Buy 5 shares (costs ~$10)
3. Try to buy $95 more (total would be $105)
4. Click "Buy by cost"

**Expected:**
- Alert about market limit exceeded
- Trade fails
- Portfolio unchanged

---

### Test 9: Insufficient Balance

**Steps:**
1. Register new user (balance $1000)
2. On market detail
3. Try to buy shares worth more than remaining balance
4. Click "Buy"

**Expected:**
- Alert: "Insufficient balance for this trade"
- Trade does not execute

---

### Test 10: Negative Delta Prevention

**Steps:**
1. On market detail
2. Try to enter -5 in delta field
3. Click "Buy"

**Expected:**
- Alert: "Delta must be positive"
- Trade does not execute

---

### Test 11: Multiple Markets

**Steps:**
1. Register user
2. Buy shares on Market 1 (e.g., 5 YES)
3. Go to Markets → Open Market 2
4. Buy shares on Market 2 (e.g., 3 YES)
5. Click "Portfolio"

**Expected:**
- Both markets shown in portfolio table
- Each market shows correct positions
- Prices computed correctly for each market

---

### Test 12: Price Updates

**Steps:**
1. Register user
2. Buy 5 YES on a market
3. Note current YES price
4. Refresh page (F5)
5. Go to Portfolio
6. Note YES price (should be different after qYes increased)

**Expected:**
- Prices change based on LMSR formula
- YES price increased after buying YES
- NO price decreased accordingly

---

## API Endpoints Reference

### Authentication
- `POST /api/register` → `{ username, password }`
- `POST /api/login` → `{ username, password }`

### Markets
- `GET /api/markets` → all markets
- `GET /api/markets/:id` → market detail
- `GET /api/markets/:id/price` → `{ priceYes, priceNo }`
- `POST /api/markets/:id/buy` → `{ deltaYes | deltaNo | cost, userId?, tradeType? }`

### Portfolio (NEW)
- `GET /api/me/positions` → requires `x-user-id` header

### Response Example (POST /api/markets/:id/buy)
```json
{
  "trade": {
    "id": "uuid",
    "marketId": "uuid",
    "userId": "uuid",
    "deltaYes": 5,
    "deltaNo": 0,
    "cost": 25.50,
    "timestamp": 1701696000000
  },
  "market": {
    "id": "uuid",
    "title": "Will Bitcoin...",
    "qYes": 45,
    "qNo": 30,
    "b": 10
  },
  "user": {
    "id": "uuid",
    "username": "testuser",
    "balance": 974.50,
    "positions": {
      "marketId": { "yesShares": 5, "noShares": 0 }
    }
  }
}
```

## Debugging Tips

1. **Check db.json**: Look at `backend/data/db.json` to see persisted data
2. **Browser DevTools**: 
   - Network tab to see API calls
   - Storage → LocalStorage to see userId and balance
   - Console for errors
3. **Backend logs**: npm run dev shows request logs
4. **Positions not updating?** Check if userId is being sent in request body
5. **Balance not decreasing?** Ensure trade cost was calculated correctly

## Known Limitations

1. **Simple Auth**: userId passed as plain text (not production-ready)
2. **No Selling**: Positions accumulate but can't be liquidated
3. **No History**: Individual trades visible in db.json but not in UI
4. **No Real-time Updates**: Portfolio doesn't auto-refresh with price changes
5. **Session Loss on Refresh**: Frontend state resets (localStorage preserves userId/balance)
