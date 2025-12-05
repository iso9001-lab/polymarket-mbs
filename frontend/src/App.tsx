import React from 'react'
import MarketList from './pages/MarketList'
import MarketDetail from './pages/MarketDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Portfolio from './pages/Portfolio'
import AdminPage from './pages/AdminPage'
import Scoreboard from './pages/Scoreboard'

type View = { name: 'list' } | { name: 'detail'; id: string } | { name: 'login' } | { name: 'register' } | { name: 'portfolio' } | { name: 'admin' } | { name: 'scoreboard' };

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
  const [userId, setUserId] = React.useState<string | null>(localStorage.getItem('userId'));
  const [isAdmin, setIsAdmin] = React.useState<boolean>(localStorage.getItem('isAdmin') === 'true');

  const updateBalance = (amount: number) => {
    const newBalance = balance - amount;
    setBalance(newBalance);
    localStorage.setItem('balance', String(newBalance));
  };

  const handleLogin = (id: string, admin: boolean = false) => {
    setUserId(id);
    setIsAdmin(admin);
    localStorage.setItem('userId', id);
    localStorage.setItem('isAdmin', String(admin));
    setView({ name: 'list' });
  };

  const handleLogout = () => {
    setUserId(null);
    setIsAdmin(false);
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('balance');
    setBalance(initBalance());
    setView({ name: 'login' });
  };

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Polymarket-MBS</h2>
        <button onClick={() => setView({ name: 'list' })}>Markets</button>
        {userId && <button onClick={() => setView({ name: 'portfolio' })}>Portfolio</button>}
        {userId && <button onClick={() => setView({ name: 'scoreboard' })}>Scoreboard</button>}
        {userId && isAdmin && <button onClick={() => setView({ name: 'admin' })} style={{ fontWeight: 'bold', backgroundColor: '#ffe082' }}>Admin</button>}
        {!userId && <button onClick={() => setView({ name: 'login' })}>Login</button>}
        {!userId && <button onClick={() => setView({ name: 'register' })}>Register</button>}
        {userId && <button onClick={handleLogout}>Logout</button>}
        <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 'bold' }}>Balance: ${balance.toFixed(2)}</div>
      </header>
      <main>
        {view.name === 'list' && <MarketList onOpen={(id) => setView({ name: 'detail', id })} />}
        {view.name === 'detail' && <MarketDetail id={view.id} onBack={() => setView({ name: 'list' })} onTrade={updateBalance} />}
        {view.name === 'login' && <Login onDone={handleLogin} />}
        {view.name === 'register' && <Register onDone={() => setView({ name: 'login' })} />}
        {view.name === 'portfolio' && <Portfolio onBack={() => setView({ name: 'list' })} />}
        {view.name === 'admin' && <AdminPage onBack={() => setView({ name: 'list' })} />}
        {view.name === 'scoreboard' && <Scoreboard onBack={() => setView({ name: 'list' })} />}
      </main>
    </div>
  )
}
