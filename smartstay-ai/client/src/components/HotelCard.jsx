import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BookingFlow from './BookingFlow'

export default function HotelCard({ hotel, selectable=false, selected=false, onSelect }) {
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const location = useLocation()
  
  // Extract search params to pass to hotel details
  const searchParams = new URLSearchParams(location.search)
  const checkIn = searchParams.get('checkIn') || searchParams.get('checkin')
  const checkout = searchParams.get('checkOut') || searchParams.get('checkout')
  
  // Build details URL with dates if available
  const getDetailsUrl = () => {
    let url = `/hotels/${hotel.id}`
    const params = new URLSearchParams()
    
    if (checkIn) params.set('checkIn', checkIn)
    if (checkout) params.set('checkout', checkout)
    
    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  const renderFacilities = () => {
    if (!hotel.facilities?.length) return null
    
    const facilityIcons = {
      'pool': '🏊',
      'spa': '💆',
      'wifi': '📶',
      'gym': '💪',
      'restaurant': '🍽️',
      'bar': '🍸',
      'parking': '🚗',
      'ac': '❄️',
      'room service': '🛎️'
    }
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {hotel.facilities.slice(0, 4).map((facility, index) => {
          const icon = Object.keys(facilityIcons).find(key => 
            facility.toLowerCase().includes(key)
          )
          return (
            <span 
              key={index}
              className="text-xs px-2 py-1 bg-neutral-100 dark:bg-white/10 rounded-full flex items-center gap-1 text-neutral-700 dark:text-white/90"
            >
              {facilityIcons[icon] || '🏨'} {facility}
            </span>
          )
        })}
        {hotel.facilities.length > 4 && (
          <span className="text-xs text-neutral-500 dark:text-white/70">+{hotel.facilities.length - 4} more</span>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`card-glass overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${selected? 'ring-2 ring-primary-500 shadow-glow-primary' : ''}`}>
        {hotel.image && (
          <div className="relative">
            <img src={hotel.image} alt={hotel.name} className="w-full h-40 object-cover" />
            {(hotel.stars || hotel.rating) && (
              <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="text-xs text-yellow-400">
                  {'⭐'.repeat(Math.min(Math.floor(hotel.stars || hotel.rating), 5))}
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-4 space-y-3 text-neutral-800 dark:text-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg font-display tracking-tight drop-shadow line-clamp-2">
                {hotel.name}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-white/70 line-clamp-1">{hotel.location}</p>
            </div>
            
            {selectable && (
              <label className="text-xs flex items-center gap-1 cursor-pointer text-neutral-600 dark:text-white/70">
                <input 
                  type="checkbox" 
                  checked={selected} 
                  onChange={e => onSelect?.(hotel, e.target.checked)}
                  className="rounded border-neutral-300 dark:border-white/20 bg-white/20 dark:bg-white/10 text-primary-500 focus:ring-primary-500"
                /> 
                <span>Compare</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{hotel.rating || hotel.stars || 'N/A'}</span>
              {(hotel.rating || hotel.stars) && hotel.rating > 5 && (
                <span className="text-xs text-neutral-500 dark:text-white/60">/10</span>
              )}
            </div>
            
            {hotel.price && (
              <div className="flex items-center gap-1">
                <span>💰</span>
                <span>₹{hotel.price}</span>
                <span className="text-xs text-neutral-500 dark:text-white/70">/{hotel.currency || 'INR'}</span>
              </div>
            )}
          </div>

          {renderFacilities()}

          <div className="flex gap-2 pt-2">
            <Link 
              className="aero-btn-secondary flex-1 text-center" 
              to={getDetailsUrl()}
            >
              📋 Details
            </Link>
            <button 
              className="aero-btn-primary flex-1"
              onClick={() => setShowBookingFlow(true)}
            >
              🎯 Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      <BookingFlow
        hotel={hotel}
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
      />
    </>
  )
}
