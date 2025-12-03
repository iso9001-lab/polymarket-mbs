import React from 'react'
import MarketList from './pages/MarketList'
import MarketDetail from './pages/MarketDetail'
import Login from './pages/Login'
import Register from './pages/Register'

type View = { name: 'list' } | { name: 'detail'; id: string } | { name: 'login' } | { name: 'register' };

function initBalance() {
  const stored = localStorage.getItem('balance');
  if (stored) return Number(stored);
  const initial = 1000;
  localStorage.setItem('balance', String(initial));
  return initial;
}

export default function App() {
  const [view, setView] = React.useState<View>({ name: 'list' });
  const [balance, setBalance] = React.useState<number>(initBalance);

  const updateBalance = (amount: number) => {
    const newBalance = balance - amount;
    setBalance(newBalance);
    localStorage.setItem('balance', String(newBalance));
  };

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Polymarket-MBS</h2>
        <button onClick={() => setView({ name: 'list' })}>Markets</button>
        <button onClick={() => setView({ name: 'login' })}>Login</button>
        <button onClick={() => setView({ name: 'register' })}>Register</button>
        <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 'bold' }}>Balance: ${balance.toFixed(2)}</div>
      </header>
      <main>
        {view.name === 'list' && <MarketList onOpen={(id) => setView({ name: 'detail', id })} />}
        {view.name === 'detail' && <MarketDetail id={view.id} onBack={() => setView({ name: 'list' })} onTrade={updateBalance} />}
        {view.name === 'login' && <Login onDone={() => setView({ name: 'list' })} />}
        {view.name === 'register' && <Register onDone={() => setView({ name: 'login' })} />}
      </main>
    </div>
  )
}
