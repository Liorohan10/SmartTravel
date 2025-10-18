import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import HotelCard from '../components/HotelCard.jsx'
import HotelComparison from '../components/HotelComparison.jsx'

function useQuery() { const { search } = useLocation(); return useMemo(() => new URLSearchParams(search), [search]) }

export default function HotelList() {
  const q = useQuery()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ priceRange: '', stars: '', amenities: '' })
  const [compareIds, setCompareIds] = useState([])
  const [comparison, setComparison] = useState('')
  const [nl, setNl] = useState('')

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true); setError('')
      try {
        const params = Object.fromEntries(q.entries())
        const { data } = await api.get('/liteapi/search', { params })
        const items = Array.isArray(data?.hotels) ? data.hotels : (Array.isArray(data) ? data : [])
        setHotels(items.map((h,i)=>({
          id: h.id || h.hotelId || String(i),
          name: h.name || h.title || 'Hotel',
          location: h.location || h.address?.city || '',
          rating: h.rating || h.stars || h.score,
          price: h.price?.amount || h.price || h.rate,
          image: h.image || h.images?.[0] || undefined,
          raw: h,
        })))
      } catch (e) {
        setError('Failed to load hotels.');
      } finally { setLoading(false) }
    }
    fetchHotels()
  }, [q])

  function toggleCompare(hotel, checked) {
    setCompareIds(prev => {
      const set = new Set(prev)
      if (checked) { set.add(hotel.id) } else { set.delete(hotel.id) }
      return Array.from(set).slice(0,3) // up to 3
    })
  }

  async function runComparison() {
    const selected = hotels.filter(h => compareIds.includes(h.id)).slice(0,3)
    try {
      const { data } = await api.post('/gemini/compare', { hotels: selected.map(h=>h.raw || h) })
      setComparison(data.comparison)
    } catch {
      setComparison('Comparison failed. Try again.')
    }
  }

  const filtered = hotels.filter(h => {
    const okPrice = true // client-side price filter could be applied if price is numeric
    const okStars = filters.stars ? String(h.rating||'').startsWith(String(filters.stars)) : true
    const okAmenities = filters.amenities ? String(h.raw?.amenities||'').toLowerCase().includes(filters.amenities.toLowerCase()) : true
    return okPrice && okStars && okAmenities
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Stars</label>
          <select className="input" value={filters.stars} onChange={e=>setFilters(f=>({...f, stars: e.target.value}))}>
            <option value="">Any</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
          </select>
        </div>
        <div>
          <label className="label">Amenities</label>
          <input className="input" value={filters.amenities} onChange={e=>setFilters(f=>({...f, amenities: e.target.value}))} placeholder="pool, spa" />
        </div>
        <button className="btn" onClick={runComparison} disabled={compareIds.length<2}>Compare Selected ({compareIds.length})</button>
      </div>

      <div className="mt-4 p-3 rounded border bg-white">
        <div className="font-medium mb-2">Smart Filters (Natural language)</div>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="e.g., budget-friendly 4-star hotels with pool near Connaught Place" value={nl} onChange={e=>setNl(e.target.value)} />
          <button className="btn" onClick={async ()=>{
            try {
              const { data } = await api.post('/gemini/smart-filter', { query: nl })
              const f = data.filter
              if (typeof f === 'object') {
                // Build a new URL with new filters
                const params = new URLSearchParams(window.location.search)
                if (f.destination) params.set('destination', f.destination)
                if (f.minPrice) params.set('minPrice', f.minPrice)
                if (f.maxPrice) params.set('maxPrice', f.maxPrice)
                if (f.stars) params.set('stars', f.stars)
                if (Array.isArray(f.amenities)) params.set('amenities', f.amenities.join(','))
                if (f.neighborhood) params.set('neighborhood', f.neighborhood)
                window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
                // Trigger reload
                window.dispatchEvent(new Event('popstate'))
              }
            } catch(err) { console.error(err) }
          }}>Apply</button>
        </div>
      </div>

      {loading && <div className="mt-6 animate-pulse">Loading hotels…</div>}
      {error && <div className="mt-6 text-red-600">{error}</div>}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {filtered.map(h => (
          <HotelCard key={h.id} hotel={h} selectable selected={compareIds.includes(h.id)} onSelect={toggleCompare} />
        ))}
      </div>

      <HotelComparison hotels={hotels.filter(h=>compareIds.includes(h.id))} comparisonText={comparison} />
    </div>
  )
}
