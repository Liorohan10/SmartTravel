import React from 'react'
import { Link } from 'react-router-dom'

export default function HotelCard({ hotel, selectable=false, selected=false, onSelect }) {
  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${selected? 'ring-2 ring-neon-500' : ''}`}>
      {hotel.image && <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover" />}
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg">{hotel.name}</h3>
          {selectable && (
            <label className="text-sm flex items-center gap-1">
              <input type="checkbox" checked={selected} onChange={e=>onSelect?.(hotel, e.target.checked)} /> Compare
            </label>
          )}
        </div>
        <p className="text-sm text-gray-600">{hotel.location}</p>
        <p className="text-sm">⭐ {hotel.rating ?? 'N/A'} • ${hotel.price ?? '—'}</p>
        <div className="flex gap-2 pt-2">
          <Link className="btn-secondary" to={`/hotels/${hotel.id}`}>View Details</Link>
          <button className="btn" onClick={()=>alert('Booking flow wired to /api/liteapi/book (stub)')}>Book Now</button>
        </div>
      </div>
    </div>
  )
}
