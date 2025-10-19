import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('lastSearch')
    return saved ? JSON.parse(saved) : { destination: '', checkIn: '', checkOut: '', guests: 2, minPrice: '', maxPrice: '', amenities: '' }
  })

  useEffect(() => {
    localStorage.setItem('lastSearch', JSON.stringify(form))
  }, [form])

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })) }

  function onSubmit(e) {
    e.preventDefault()
    const params = new URLSearchParams({ ...form, amenities: form.amenities })
    navigate(`/hotels?${params.toString()}`)
  }

  return (
    <form onSubmit={onSubmit} className="grid lg:grid-cols-6 gap-6">
      <div>
        <label className="body-small font-medium mb-3 block opacity-90">
          📍 Destination
        </label>
        <input 
          className="aero-input" 
          placeholder="City or area" 
          value={form.destination} 
          onChange={e=>update('destination', e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="body-small font-medium mb-3 block opacity-90">
          📅 Check-in
        </label>
        <input 
          type="date" 
          className="aero-input" 
          value={form.checkIn} 
          onChange={e=>update('checkIn', e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="body-small font-medium mb-3 block opacity-90">
          📅 Check-out
        </label>
        <input 
          type="date" 
          className="aero-input" 
          value={form.checkOut} 
          onChange={e=>update('checkOut', e.target.value)} 
          required 
        />
      </div>
      <div>
        <label className="body-small font-medium mb-3 block opacity-90">
          👥 Guests
        </label>
        <input 
          type="number" 
          min="1" 
          className="aero-input" 
          placeholder="e.g., 2" 
          value={form.guests} 
          onChange={e=>update('guests', e.target.value)} 
        />
      </div>
      <div>
        <label className="body-small font-medium mb-3 block opacity-90">
          💰 Price range
        </label>
        <input 
          className="aero-input" 
          placeholder="50-200" 
          value={`${form.minPrice}${form.maxPrice?'-'+form.maxPrice:''}`}
          onChange={e=>{
            const v=e.target.value; const [min,max]=v.split('-'); update('minPrice',min||''); update('maxPrice',max||'')
          }} 
        />
      </div>
      <div>
        <label className="body-small font-medium mb-3 block opacity-90">
          🏊 Amenities
        </label>
        <input 
          className="aero-input" 
          placeholder="pool, spa" 
          value={form.amenities} 
          onChange={e=>update('amenities', e.target.value)} 
        />
      </div>
      <div className="lg:col-span-6 flex justify-center mt-4">
        <button className="aero-btn-primary px-12">
          ✨ Search Hotels
        </button>
      </div>
    </form>
  )
}
