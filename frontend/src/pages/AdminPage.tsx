import React from 'react'

export default function AdminPage({ onBack }: { onBack: () => void }) {
  const [markets, setMarkets] = React.useState<any[]>([]);
  const userId = localStorage.getItem('userId');

  React.useEffect(() => {
    fetch('/api/markets')
      .then(r => r.json())
      .then(setMarkets)
      .catch(err => console.error('Failed to fetch markets:', err));
  }, []);

  async function resolveMarket(marketId: string, result: 'YES' | 'NO') {
    if (!userId) {
      alert('Not logged in');
      return;
    }
    const endpoint = result === 'YES' 
      ? `/api/admin/markets/${marketId}/resolveYes`
      : `/api/admin/markets/${marketId}/resolveNo`;
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'x-user-id': userId }
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`Error: ${data.error || 'Failed to resolve market'}`);
      return;
    }
    alert(`Market resolved as ${result}`);
    // Refresh markets
    const updated = await fetch('/api/markets').then(r => r.json());
    setMarkets(updated);
  }

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <h2>Admin Panel - Resolve Markets</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Result</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {markets.map(m => (
            <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{m.title}</td>
              <td style={{ padding: 8 }}>{m.status || 'open'}</td>
              <td style={{ padding: 8 }}>{m.result || '-'}</td>
              <td style={{ padding: 8 }}>
                {m.status !== 'resolved' ? (
                  <>
                    <button onClick={() => resolveMarket(m.id, 'YES')} style={{ marginRight: 8 }}>
                      Resolve YES
                    </button>
                    <button onClick={() => resolveMarket(m.id, 'NO')}>
                      Resolve NO
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#888' }}>Resolved</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
