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
          {scoreboard.length > 0 ? scoreboard.map((user, index) => (
            <tr key={user.username}>
              <td style={{ padding: 8 }}>{index + 1}</td>
              <td style={{ padding: 8 }}>{user.username || 'Unknown'}</td>
              <td style={{ padding: 8 }}>{user.balance != null ? user.balance.toFixed(2) : 'N/A'}</td>
            </tr>
          )) : <tr><td colSpan={3} style={{ textAlign: 'center' }}>No data available</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
