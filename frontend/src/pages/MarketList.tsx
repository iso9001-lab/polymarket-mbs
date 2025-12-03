import React from 'react'

export default function MarketList({ onOpen }: { onOpen: (id: string) => void }) {
  const [markets, setMarkets] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/markets')
      .then(r => r.json())
      .then(setMarkets)
      .catch(console.error)
  }, []);

  return (
    <div>
      <h3>Markets</h3>
      <ul>
        {markets.map(m => (
          <li key={m.id} style={{ marginBottom: 8 }}>
            <strong>{m.title}</strong>
            <div style={{ fontSize: 12 }}>{m.description}</div>
            <button onClick={() => onOpen(m.id)}>Open</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
