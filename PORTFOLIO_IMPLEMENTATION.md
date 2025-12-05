# Portfolio System Implementation

## Overview

A complete per-user portfolio tracking system for the LMSR prediction market has been implemented end-to-end. Users can now:

1. Register and login with balance tracking
2. Buy YES/NO shares on markets
3. View their portfolio with current positions
4. See real-time position updates after trades

## Backend Implementation

### 1. Extended Type Definitions (`backend/src/types.ts`)

**New Position Interface:**
```typescript
export interface Position {
  yesShares: number;
  noShares: number;
}
```

**Updated User Interface:**
```typescript
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  balance: number;                    // New: tracks user balance
  positions: {                        // New: per-market positions
    [marketId: string]: Position;
  };
}
```

**Updated Trade Interface:**
Added `deltaNo` field to track NO share purchases:
```typescript
export interface Trade {
  id: string;
  marketId: string;
  userId?: string;
  deltaYes: number;
  deltaNo: number;        // New
  cost: number;
  timestamp: number;
}
```

### 2. Database Layer (`backend/src/db/jsonDb.ts`)

**New Methods:**
- `findUserById(id: string)`: Fetch user by ID
- `upsertUser(user: User)`: Create or update user with persistence

### 3. Authentication Routes (`backend/src/routes/auth.ts`)

**Registration (`POST /register`):**
- Creates new user with `balance: 1000`
- Initializes empty `positions: {}`

**Login (`POST /login`):**
- Returns user balance in response
- Allows frontend to restore user state

### 4. Markets Routes - Trade Execution (`backend/src/routes/markets.ts`)

**Updated `POST /markets/:id/buy`:**

1. **Accept userId in request body:**
   ```typescript
   const userId = body.userId;
   if (userId) {
     user = db.findUserById(userId);
   }
   ```

2. **Validate user balance:**
   ```typescript
   if (user && user.balance < cost) {
     return rep.status(400).send({ error: 'insufficient balance' });
   }
   ```

3. **Update portfolio after successful trade:**
   ```typescript
   if (user) {
     if (!user.positions) user.positions = {};
     if (!user.positions[id]) user.positions[id] = { yesShares: 0, noShares: 0 };
     
     if (tradeType === 'yes') {
       user.positions[id].yesShares += delta;
     } else {
       user.positions[id].noShares += delta;
     }
     
     user.balance -= cost;
     db.upsertUser(user);
   }
   ```

4. **Return updated user data:**
   ```typescript
   return { trade, market, user };
   ```

### 5. New User Routes (`backend/src/routes/user.ts`)

**Portfolio Endpoint (`GET /me/positions`):**

- **Authentication:** Uses `x-user-id` header
- **Response:** Includes user balance and all market positions with current prices
- **Computation:** Uses existing `priceYes()` and `priceNo()` LMSR functions

```typescript
interface PortfolioResponse {
  user: { id, username, balance };
  positions: [{
    marketId, title, yesShares, noShares,
    currentYesPrice, currentNoPrice
  }]
}
```

### 6. Route Registration (`backend/src/routes/index.ts`)

New user routes registered in main router:
```typescript
await userRoutes(fastify);
```

## Frontend Implementation

### 1. App State Management (`frontend/src/App.tsx`)

**New State:**
- `userId`: Tracks logged-in user
- `handleLogin(id)`: Stores userId in localStorage and state
- `handleLogout()`: Clears userId and resets balance
- Conditional Portfolio button visible when logged in

### 2. Login Component (`frontend/src/pages/Login.tsx`)

**Updates:**
- Stores `userId` in localStorage on successful login
- Passes userId to parent `onDone` callback
- Stores user balance for session

### 3. Portfolio Page (`frontend/src/pages/Portfolio.tsx`)

**Features:**
- Fetches `/api/me/positions` with userId header
- Displays all active positions in a table
- Shows current YES/NO prices
- Displays user balance

**Table Columns:**
- Market title
- YES shares
- YES price
- NO shares
- NO price

### 4. Market Detail Page (`frontend/src/pages/MarketDetail.tsx`)

**New Features:**
- Fetches user position on mount
- Displays "Your Position: X YES, Y NO" box
- Updates position in real-time after trades
- Extracts user position from trade response

### 5. Trade Form Component (`frontend/src/components/TradeForm.tsx`)

**Updates:**
- Accepts `userId` prop
- Includes `userId` in trade request body
- Allows trades to update portfolio on backend

## Data Flow

### User Registration
1. Register form → POST /register
2. Backend creates User with balance: 1000, positions: {}
3. User data stored in db.json

### User Trade Execution
1. User submits trade with userId
2. Backend validates:
   - Delta > 0 and ≤ 10
   - Cost > 0 and ≤ $100
   - Total market spending ≤ $100
   - User balance ≥ cost
3. Backend updates:
   - Market qYes/qNo
   - User balance: -= cost
   - User positions: += delta
4. Response includes updated user object
5. Frontend updates position display immediately

### Portfolio View
1. User clicks "Portfolio"
2. Frontend fetches /me/positions with userId header
3. Backend returns all market positions with current prices
4. Frontend renders table with active positions

## Validation Rules (Frontend & Backend)

1. **No Negative Deltas:** Only purchases allowed (delta > 0)
2. **Max 10 Shares per Trade:** delta ≤ 10
3. **Max $100 per Market:** total cost per market ≤ $100
4. **Sufficient Balance:** user.balance ≥ cost
5. **Positions Never Negative:** Enforced by only allowing buys

## Storage

All data persists in `backend/data/db.json`:
- User profiles with balances and positions
- Market state (qYes, qNo)
- Trade history

## Example Scenarios

### Scenario 1: New User Registration
```
→ POST /register { username, password }
← { id, username }
  Backend creates: User { balance: 1000, positions: {} }
```

### Scenario 2: Buy YES Shares
```
→ POST /markets/:id/buy { deltaYes: 5, userId }
  Validates: 5 > 0 ✓, 5 ≤ 10 ✓, cost ≤ 100 ✓, balance sufficient ✓
  Calculates cost via costToBuyDeltaYes()
  Updates: market.qYes += 5, user.balance -= cost, user.positions[id].yesShares += 5
← { trade, market, user: { balance: 950, positions: { id: { yesShares: 5, noShares: 0 } } } }
```

### Scenario 3: View Portfolio
```
→ GET /me/positions with header x-user-id: userId
  Fetches user and all markets
  Computes current prices for each market
← { user: { balance, username }, positions: [{ marketId, title, yesShares, noShares, prices }] }
```

## Architecture Decisions

1. **Simple Authentication:** userId passed in header (suitable for demo, not production-ready)
2. **Minimal Portfolio Model:** Only tracks accumulated shares; no cost basis or unrealized P&L
3. **No Selling:** Currently only supports buy orders; portfolio is append-only
4. **Stateless Endpoint:** /me/positions computes prices on-demand using LMSR functions
5. **Optimistic UI Updates:** Frontend updates position immediately after trade confirmation

## Future Enhancements

1. Implement selling/redemption of shares
2. Add unrealized P&L calculation
3. Persist JWT tokens for better auth
4. Add portfolio value tracking
5. Implement position history/trading log
6. Add balance refresh endpoint
