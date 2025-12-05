# Polymarket-MBS

Full-stack minimal prediction market demo (Fastify + TypeScript backend, React + Vite frontend).

Run locally inside GitHub Codespaces (or any environment with Node.js):

1. Start backend

```bash
cd backend
npm install
npm run dev
```

Backend listens on port `4000` by default. The server exposes API under `/`.

2. Start frontend (in a separate terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs Vite on port `5173` and is configured to proxy API requests to the backend base path `/api`.

Notes
- The backend uses a simple file-based JSON DB at `backend/data/db.json` for development.
- LMSR logic is implemented in `backend/src/lmsr/lmsr.ts`.
# Start both (single command)

You can start both backend and frontend together from the repository root using the `dev` script. This uses `concurrently` to run both dev servers in one terminal.

```bash
cd /workspaces/polymarket-mbs
npm install       # installs root devDependencies (concurrently)
npm run install-all  # installs backend and frontend deps
npm run dev
```

Notes:
- If you already have the backend or frontend running in other terminals, stop them first to avoid port conflicts before running the root `dev`.
- Backend is served on `http://localhost:4000` and frontend on `http://localhost:5173` (Vite). The frontend proxies `/api/*` to the backend.

## Trading Rules

Die folgenden Regeln gelten für alle Trades:

1. **Keine negativen Deltas**: Benutzer können nur Shares kaufen, nicht verkaufen. Damit wird sichergestellt, dass Benutzer kein Geld zurückbekommen.

2. **Maximal 10 Shares pro Trade**: Jeder einzelne Trade kann maximal 10 Shares umfassen.
   - Frontend Validierung: Eingabefeld prüft auf max. 10
   - Backend Validierung: Fehler wenn deltaYes oder deltaNo > 10

3. **Maximal $100 pro Benutzer und pro Markt**: Pro Benutzer kann maximal $100 insgesamt pro Markt ausgegeben werden.
   - Dies ist das kumulative Limit über alle Trades eines einzelnen Benutzers auf diesem Markt
   - Frontend Validierung: "Spend exact cost" limitiert auf max. $100 pro Trade; kumulative Prüfungen erfolgen serverseitig
   - Backend Validierung: Prüft `getTotalSpentByUserOnMarket(userId, marketId)` + neue Kosten ≤ $100

## Implementation Details

- **LMSR Logic**: Implementiert in `backend/src/lmsr/lmsr.ts`
- **Trade Handling**: Backend-Route `/markets/:id/buy` verwaltet beide Trades (YES und NO)
- **Database**: Einfache JSON-DB unter `backend/data/db.json`
- **Frontend Components**: TradeForm-Komponente mit Trade-Type-Selector (YES/NO)

# polymarket-mbs
Prediction-Market-Projekt „Polymarket-MBS" mit Backend ↔ Frontend
