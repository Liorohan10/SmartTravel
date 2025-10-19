import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function SearchBar() {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('lastSearch')
    const defaultForm = { 
      destination: '', 
      checkIn: '', 
      checkOut: '', 
      guests: 2, 
      minPrice: '', 
      maxPrice: '', 
      amenities: '',
      aiSearch: '',
      strictFacilityFiltering: false
    }
    
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved)
        // Merge saved data with defaults to ensure all properties exist
        return { ...defaultForm, ...parsedSaved }
      } catch {
        return defaultForm
      }
    }
    
    return defaultForm
  })
  
  // Place search autocomplete
  const [placeSuggestions, setPlaceSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const debounceTimer = useRef(null)

  useEffect(() => {
    localStorage.setItem('lastSearch', JSON.stringify(form))
  }, [form])

  // Debounced place search
  const searchPlaces = async (query) => {
    if (query.length < 2) {
      setPlaceSuggestions([])
      return
    }
    
    try {
      const { data } = await api.get('/liteapi/places', { params: { textQuery: query } })
      setPlaceSuggestions(data?.data || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Place search failed:', error)
      setPlaceSuggestions([])
    }
  }

  const handleDestinationChange = (value) => {
    update('destination', value)
    setSelectedPlaceId(null)
    
    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      searchPlaces(value)
    }, 300)
  }

  const selectPlace = (place) => {
    update('destination', place.name)
    setSelectedPlaceId(place.placeId)
    setShowSuggestions(false)
    setPlaceSuggestions([])
  }

  function update(key, value) { setForm(prev => ({ ...prev, [key]: value })) }

  function onSubmit(e) {
    e.preventDefault()
    
    // Build comprehensive search parameters
    const searchParams = {
      // Send destination as cityName for LiteAPI compatibility
      cityName: form.destination,
      countryCode: 'IN', // Default to India, can be enhanced with place detection later
      placeId: selectedPlaceId,
      facilities: form.amenities ? form.amenities.split(',').map(a => a.trim()) : undefined,
      checkin: form.checkIn,
      checkout: form.checkOut,
      adults: form.guests,
      currency: 'INR',
      language: 'en',
      minPrice: form.minPrice,
      maxPrice: form.maxPrice,
      strictFacilityFiltering: form.strictFacilityFiltering
    }
    
    // Remove empty values
    Object.keys(searchParams).forEach(key => 
      (!searchParams[key] || searchParams[key] === '') && delete searchParams[key]
    )
    
    const params = new URLSearchParams(searchParams)
    navigate(`/hotels?${params.toString()}`)
  }

  // AI-powered semantic search
  const handleAISearch = async () => {
    if (!form.aiSearch || !form.aiSearch.trim()) return
    
    try {
      // Use AI search directly in hotel search
      const params = new URLSearchParams({
        aiSearch: form.aiSearch,
        checkin: form.checkIn,
        checkout: form.checkOut,
        adults: form.guests,
        currency: 'INR'
      })
      
      navigate(`/hotels?${params.toString()}`)
    } catch (error) {
      console.error('AI search failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI-Powered Search */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <div>
            <h3 className="heading-4">Smart Search</h3>
            <p className="body-small opacity-70">Describe what you're looking for in natural language</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <input 
            className="aero-input flex-1" 
            placeholder="e.g., luxury beachfront hotel with spa near Mumbai airport for business trip"
            value={form.aiSearch} 
            onChange={e=>update('aiSearch', e.target.value)} 
          />
          <button 
            type="button"
            onClick={handleAISearch}
            className="aero-btn-primary px-6"
            disabled={!form.aiSearch || !form.aiSearch.trim()}
          >
            🧠 AI Search
          </button>
        </div>
      </div>

      {/* Traditional Search Form */}
      <form onSubmit={onSubmit} className="grid lg:grid-cols-6 gap-6">
        <div className="relative">
          <label className="body-small font-medium mb-3 block opacity-90">
            📍 Destination
          </label>
          <input 
            className="aero-input" 
            placeholder="City or area" 
            value={form.destination} 
            onChange={e=>handleDestinationChange(e.target.value)} 
            onFocus={() => form.destination.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            required 
          />
          
          {/* Place suggestions dropdown */}
          {showSuggestions && placeSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-panel border border-neutral-200 dark:border-white/20 rounded-xl max-h-60 overflow-y-auto z-50">
              {placeSuggestions.map((place, index) => (
                <button
                  key={place.placeId || index}
                  type="button"
                  className="w-full text-left p-3 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors border-b border-neutral-100 dark:border-white/10 last:border-b-0 text-neutral-800 dark:text-white"
                  onClick={() => selectPlace(place)}
                >
                  <div className="body font-medium">{place.name}</div>
                  {place.description && (
                    <div className="body-small text-neutral-600 dark:text-white/70">{place.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}
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
        <div>
          <label className="body-small font-medium mb-3 block text-neutral-700 dark:text-white/90">
            🔧 Advanced Options
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-white/90">
              <input
                type="checkbox"
                checked={form.strictFacilityFiltering}
                onChange={e => update('strictFacilityFiltering', e.target.checked)}
                className="rounded border-neutral-300 dark:border-white/20 bg-white/20 dark:bg-white/10 text-primary-500 focus:ring-primary-500"
              />
              <span className="body-small">Must have all amenities</span>
            </label>
          </div>
        </div>
        
        <div className="lg:col-span-6 flex justify-center mt-4">
          <button className="aero-btn-primary px-12">
            ✨ Search Hotels
          </button>
        </div>
      </form>
    </div>
  )
}
