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
        
        console.log('🔍 HotelList - Searching with params:', params)
        
        // Choose appropriate endpoint based on search type
        let endpoint = '/liteapi/hotels/search'
        if (params.aiSearch) {
          // Use AI-powered search
          endpoint = '/liteapi/hotels/search'
        } else if (params.query && !params.destination) {
          // Use semantic hotel search for hotel name queries
          endpoint = '/liteapi/hotels/semantic-search'
        }
        
        const { data } = await api.get(endpoint, { params })
        
        console.log('📦 Raw API response:', data)
        
        // Handle different response formats from LiteAPI
        // LiteAPI returns: { data: [...] } or { hotels: [...] }
        const items = Array.isArray(data?.data) ? data.data :
                     Array.isArray(data?.hotels) ? data.hotels : 
                     Array.isArray(data) ? data : []
        
        console.log('✅ Extracted hotels:', items.length, 'hotels')
        
        setHotels(items.map((h, i) => {
          // LiteAPI hotel fields
          const hotelId = h.id || h.hotelId || h.hotel_id || String(i)
          console.log(`Hotel ${i}: ID = ${hotelId}, Name = ${h.name}`)
          
          return {
            id: hotelId,
            name: h.name || h.hotel_name || h.title || 'Hotel',
            location: h.city || h.location || h.address?.city || h.address?.full || '',
            rating: h.rating || h.stars || h.score || 0,
            price: h.price?.amount || h.price || h.rate || 0,
            image: h.main_photo || h.image || h.images?.[0] || undefined,
            stars: h.starRating || h.stars || 0,
            facilities: h.hotelFacilities || h.facilities || [],
            currency: h.currency || 'INR',
            description: h.hotelDescription || h.description || '',
            raw: h,
          }
        }))
      } catch (e) {
        console.error('❌ Hotel search failed:', e)
        setError(`Failed to load hotels: ${e.response?.data?.error || e.message}`)
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

  // Get unique star ratings from available hotels
  const availableStars = [...new Set(hotels.map(h => h.stars || h.rating).filter(stars => stars && stars > 0))].sort((a, b) => b - a)
  
  const filtered = hotels.filter(h => {
    const okPrice = true // client-side price filter could be applied if price is numeric
    
    // Better star filtering logic
    const hotelStars = h.stars || h.rating
    const okStars = filters.stars ? 
      (hotelStars && Math.floor(hotelStars) === Math.floor(parseFloat(filters.stars))) : 
      true
    
    const okAmenities = filters.amenities ? 
      String(h.facilities?.join(' ') || h.raw?.amenities || '').toLowerCase().includes(filters.amenities.toLowerCase()) : 
      true
    
    return okPrice && okStars && okAmenities
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap gap-3 items-end card-glass p-3 text-neutral-800 dark:text-white">
        <div>
          <label className="label">Stars</label>
          <select className="input" value={filters.stars} onChange={e=>setFilters(f=>({...f, stars: e.target.value}))}>
            <option value="">Any</option>
            {availableStars.map(stars => (
              <option key={stars} value={stars}>
                {Math.floor(stars)} {Math.floor(stars) === 1 ? 'Star' : 'Stars'}
                {stars % 1 !== 0 && '+'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Amenities</label>
          <input className="input" value={filters.amenities} onChange={e=>setFilters(f=>({...f, amenities: e.target.value}))} placeholder="pool, spa" />
        </div>
        <button className="btn" onClick={runComparison} disabled={compareIds.length<2}>Compare Selected ({compareIds.length})</button>
      </div>

      <div className="mt-4 p-3 card-glass text-neutral-800 dark:text-white">
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

      {loading && <div className="mt-6 animate-pulse text-neutral-600 dark:text-white/80">Loading hotels…</div>}
      {error && <div className="mt-6 text-red-600 dark:text-red-300">{error}</div>}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {filtered.map(h => (
          <HotelCard key={h.id} hotel={h} selectable selected={compareIds.includes(h.id)} onSelect={toggleCompare} />
        ))}
      </div>

      <HotelComparison hotels={hotels.filter(h=>compareIds.includes(h.id))} comparisonText={comparison} />
    </div>
  )
}
