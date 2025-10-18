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
    <form onSubmit={onSubmit} className="grid lg:grid-cols-6 gap-3">
      <input className="input" placeholder="Destination" value={form.destination} onChange={e=>update('destination', e.target.value)} required />
      <input type="date" className="input" value={form.checkIn} onChange={e=>update('checkIn', e.target.value)} required />
      <input type="date" className="input" value={form.checkOut} onChange={e=>update('checkOut', e.target.value)} required />
      <input type="number" min="1" className="input" placeholder="Guests" value={form.guests} onChange={e=>update('guests', e.target.value)} />
      <input className="input" placeholder="Price min-max (e.g. 50-200)" value={`${form.minPrice}${form.maxPrice?'-'+form.maxPrice:''}`}
        onChange={e=>{
          const v=e.target.value; const [min,max]=v.split('-'); update('minPrice',min||''); update('maxPrice',max||'')
        }} />
      <input className="input" placeholder="Amenities (comma-separated)" value={form.amenities} onChange={e=>update('amenities', e.target.value)} />
      <button className="btn col-span-2 lg:col-span-1">Search Hotels</button>
    </form>
  )
}
