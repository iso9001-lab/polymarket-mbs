import React from 'react'

export default function Register({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  async function submit(e: any) {
    e.preventDefault();
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!res.ok) {
      const err = await res.json();
      alert('Register failed: ' + JSON.stringify(err));
      return;
    }
    alert('Registered; please login');
    onDone();
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 320 }}>
      <h3>Register</h3>
      <div>
        <input placeholder="username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      <div>
        <input type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button type="submit">Register</button>
    </form>
  )
}
