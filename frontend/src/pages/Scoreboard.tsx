import React from 'react'

export default function Scoreboard({ onBack }: { onBack: () => void }) {
  const [scoreboard, setScoreboard] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/scoreboard')
      .then(r => r.json())
      .then(d => setScoreboard(d.scoreboard || []))
      .catch(err => console.error('Failed to fetch scoreboard:', err));
  }, []);

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h2>Scoreboard</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Rank</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Balance</th>
          </tr>
        </thead>
        <tbody>
          {scoreboard.map((user, idx) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{idx + 1}</td>
              <td style={{ padding: 8 }}>{user.username}</td>
              <td style={{ padding: 8 }}>${user.balance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
