import React from 'react'

export default function HotelComparison({ hotels = [], comparisonText }) {
  if (!hotels.length) return null
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-white/90">Comparison</h3>
      <div className="grid md:grid-cols-3 gap-3">
        {hotels.map(h => (
          <div key={h.id} className="card-glass p-3 text-white">
            <div className="font-semibold">{h.name}</div>
            <div className="text-sm text-white/70">★ {h.rating ?? 'N/A'} • ${h.price ?? '—'}</div>
            <div className="text-sm">{h.location}</div>
          </div>
        ))}
      </div>
      {comparisonText && (
        <div className="mt-3 p-3 card-glass whitespace-pre-wrap text-sm text-white">{comparisonText}</div>
      )}
    </div>
  )
}
