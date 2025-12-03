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
# polymarket-mbs
Prediction-Market-Projekt „Polymarket-MBS“ mit Backend ↔ Frontend
