import React from 'react'
import { Link } from 'react-router-dom'

export default function HotelCard({ hotel, selectable=false, selected=false, onSelect }) {
  return (
    <div className={`card-glass overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-glow ${selected? 'ring-2 ring-neon-500 shadow-glow' : ''}`}>
      {hotel.image && <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover" />}
      <div className="p-4 space-y-2 text-white">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg font-display tracking-tight drop-shadow">{hotel.name}</h3>
          {selectable && (
            <label className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={selected} onChange={e=>onSelect?.(hotel, e.target.checked)} /> Compare
            </label>
          )}
        </div>
        <p className="text-sm text-white/70">{hotel.location}</p>
        <p className="text-sm">★ {hotel.rating ?? 'N/A'} • ${hotel.price ?? '—'}</p>
        <div className="flex gap-2 pt-2">
          <Link className="btn-secondary" to={`/hotels/${hotel.id}`}>View Details</Link>
          <button className="btn" onClick={()=>alert('Booking flow wired to /api/liteapi/book (stub)')}>Book Now</button>
        </div>
      </div>
    </div>
  )
}
