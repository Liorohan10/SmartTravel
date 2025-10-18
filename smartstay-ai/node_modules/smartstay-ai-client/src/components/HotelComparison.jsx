import React from 'react'

export default function HotelComparison({ hotels = [], comparisonText }) {
  if (!hotels.length) return null
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Comparison</h3>
      <div className="grid md:grid-cols-3 gap-3">
        {hotels.map(h => (
          <div key={h.id} className="border rounded p-3 bg-white">
            <div className="font-semibold">{h.name}</div>
            <div className="text-sm text-gray-600">⭐ {h.rating ?? 'N/A'} • ${h.price ?? '—'}</div>
            <div className="text-sm">{h.location}</div>
          </div>
        ))}
      </div>
      {comparisonText && (
        <div className="mt-3 p-3 border rounded bg-gray-50 whitespace-pre-wrap text-sm">{comparisonText}</div>
      )}
    </div>
  )
}
