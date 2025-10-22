import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { getHotelDetails, getHotelReviews, searchRates } from '../services/liteApiService'
import BookingFlow from '../components/BookingFlow'

export default function HotelDetails() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [hotelDetails, setHotelDetails] = useState(null)
  const [reviews, setReviews] = useState([])
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)
  const [rates, setRates] = useState(null)
  const [ratesLoading, setRatesLoading] = useState(false)

  useEffect(() => {
    async function fetchHotelData() {
      setLoading(true)
      try {
        console.log('🏨 HotelDetails - Fetching hotel details for ID:', id)
        
        // Fetch detailed hotel information from LiteAPI
        const hotelData = await getHotelDetails(id)
        const hotel = hotelData.data || hotelData
        
        console.log('✅ Hotel details loaded:', hotel)
        
        if (!hotel || !hotel.id) {
          throw new Error('Hotel not found or invalid response')
        }
        
        setHotelDetails(hotel)
        
        // Fetch AI summary
        try {
          const { data: summaryData } = await api.post('/gemini/summarize-hotel', { 
            hotel 
          })
          setSummary(summaryData.summary)
        } catch {
          setSummary('AI summary unavailable.')
        }
        
        // Fetch reviews with sentiment analysis
        loadReviews()
        
        // Load rates if dates are provided
        const checkIn = searchParams.get('checkIn')
        const checkout = searchParams.get('checkout')
        if (checkIn && checkout) {
          loadRates(checkIn, checkout)
        }
      } catch (error) {
        console.error('❌ Failed to load hotel details:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          hotelId: id
        })
        setHotelDetails(null)
        setError(error.message || 'Failed to load hotel details')
      } finally {
        setLoading(false)
      }
    }
    fetchHotelData()
  }, [id])

  const loadReviews = async () => {
    setReviewsLoading(true)
    try {
      console.log('📝 Fetching reviews for hotel:', id)
      
      const reviewData = await getHotelReviews(id, {
        limit: 20,
        getSentiment: true
      })
      
      console.log('✅ Reviews loaded:', reviewData)
      
      setReviews(reviewData.data || [])
      setSentimentAnalysis(reviewData.sentimentAnalysis || null)
    } catch (error) {
      console.error('❌ Failed to load reviews:', error)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  const loadRates = async (checkIn, checkout) => {
    setRatesLoading(true)
    try {
      console.log('💰 Fetching rates for hotel:', id)
      
      const rateData = await searchRates({
        hotelIds: [id],
        checkin: checkIn,
        checkout: checkout,
        occupancies: [{ adults: 2 }],
        currency: 'USD',
        guestNationality: 'US',
        roomMapping: true // Enable room mapping for detailed room info
      })
      
      console.log('✅ Rates loaded:', rateData)
      setRates(rateData)
    } catch (error) {
      console.error('❌ Failed to load rates:', error)
      setRates(null)
    } finally {
      setRatesLoading(false)
    }
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="card-glass p-8 text-center">
        <div className="animate-spin w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="body text-neutral-800 dark:text-white">Loading hotel details...</p>
      </div>
    </div>
  )
  
  if (!hotelDetails) return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="card-glass p-8 text-center">
        <p className="heading-2 text-red-600 dark:text-red-400 mb-4">Hotel not found</p>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="body text-red-800 dark:text-red-200 mb-2">Error: {error}</p>
            <p className="body-small text-red-600 dark:text-red-400">Hotel ID: {id}</p>
          </div>
        )}
        <p className="body text-neutral-600 dark:text-neutral-300 mb-4">
          The requested hotel could not be found or failed to load.
        </p>
        <a href="/hotels" className="aero-btn-primary inline-block">
          ← Back to Hotels
        </a>
      </div>
    </div>
  )

  const renderImageGallery = () => {
    const images = hotelDetails.hotelImages || []
    if (!images.length) return null

    return (
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative h-96 rounded-xl overflow-hidden">
          <img 
            src={images[activeImageIndex]?.urlHd || images[activeImageIndex]?.url} 
            alt={hotelDetails.name}
            className="w-full h-full object-cover"
          />
          
          {images.length > 1 && (
            <>
              <button 
                onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                ←
              </button>
              <button 
                onClick={() => setActiveImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(0, 8).map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  activeImageIndex === index 
                    ? 'border-primary-500' 
                    : 'border-transparent hover:border-neutral-300 dark:hover:border-white/30'
                }`}
              >
                <img 
                  src={image.url} 
                  alt={`View ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {images.length > 8 && (
              <button 
                onClick={() => setShowAllImages(true)}
                className="flex-shrink-0 w-20 h-16 rounded-lg bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-xs text-neutral-600 dark:text-white/70 hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors"
              >
                +{images.length - 8}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderFacilities = () => {
    // Use hotelFacilities (array of strings) or facilities (array of objects)
    const facilityList = hotelDetails.hotelFacilities || 
                        (hotelDetails.facilities || []).map(f => f.name || f) || []
    
    if (!facilityList.length) return null

    const facilityIcons = {
      'pool': '🏊', 'swimming': '🏊', 'spa': '💆', 'wifi': '📶', 'gym': '💪', 
      'restaurant': '🍽️', 'bar': '🍸', 'parking': '🚗', 
      'ac': '❄️', 'air conditioning': '❄️', 'room service': '🛎️', 'breakfast': '🥞',
      'laundry': '👔', 'concierge': '🎩', 'elevator': '🛗', 'lift': '🛗',
      'business': '💼', 'fitness': '🏋️', 'internet': '🌐', 'free wifi': '📶',
      'pet': '🐾', 'kitchen': '🍳', 'airport': '✈️', 'shuttle': '🚌',
      'beach': '🏖️', 'front': '🏨', 'safe': '🔒', 'tv': '📺'
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {facilityList.map((facility, index) => {
          const facilityLower = String(facility).toLowerCase()
          const icon = Object.keys(facilityIcons).find(key => 
            facilityLower.includes(key)
          )
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-white/5 rounded-lg">
              <span className="text-xl">{facilityIcons[icon] || '🏨'}</span>
              <span className="text-sm font-medium text-neutral-700 dark:text-white/90">{facility}</span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderRooms = () => {
    const rooms = hotelDetails.rooms || []
    if (!rooms.length) return null

    return (
      <div className="space-y-6">
        {rooms.map((room, index) => (
          <div key={room.id || index} className="bg-neutral-50 dark:bg-white/5 p-6 rounded-lg border border-neutral-200 dark:border-white/10">
            {/* Room Header */}
            <div className="mb-4">
              <h4 className="font-semibold text-lg text-neutral-800 dark:text-white mb-2">
                {room.roomName}
              </h4>
              {room.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {room.description}
                </p>
              )}
            </div>

            {/* Room Photos */}
            {room.photos && room.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
                {room.photos.slice(0, 4).map((photo, photoIndex) => (
                  <img
                    key={photoIndex}
                    src={photo.url || photo.failoverPhoto}
                    alt={photo.imageDescription || room.roomName}
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
                {room.photos.length > 4 && (
                  <div className="w-32 h-24 bg-neutral-200 dark:bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      +{room.photos.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Room Details Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {room.maxOccupancy && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Max {room.maxOccupancy} {room.maxOccupancy === 1 ? 'guest' : 'guests'}
                  </span>
                </div>
              )}
              
              {room.roomSizeSquare && (
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    {room.roomSizeSquare} {room.roomSizeUnit || 'm²'}
                  </span>
                </div>
              )}

              {room.bedTypes && room.bedTypes.length > 0 && (
                <div className="md:col-span-2">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🛏️</span>
                    <div className="text-sm text-neutral-700 dark:text-neutral-300">
                      {room.bedTypes.map((bed, idx) => (
                        <div key={idx}>
                          {bed.quantity} × {bed.bedType} {bed.bedSize && `(${bed.bedSize})`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Room Amenities */}
            {room.roomAmenities && room.roomAmenities.length > 0 && (
              <div>
                <h5 className="font-medium text-sm text-neutral-800 dark:text-white mb-2">Room Amenities</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {room.roomAmenities.slice(0, 9).map((amenity, idx) => (
                    <div key={idx} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <span>✓</span>
                      <span>{amenity.name || amenity}</span>
                    </div>
                  ))}
                  {room.roomAmenities.length > 9 && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-500">
                      +{room.roomAmenities.length - 9} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderReviews = () => {
    return (
      <div className="space-y-4">
        {reviewsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading reviews...</p>
          </div>
        ) : (
          <>
            {/* Sentiment Analysis Summary */}
            {sentimentAnalysis && (
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-6 rounded-lg border border-primary-200 dark:border-primary-700">
                <h4 className="font-semibold text-lg text-neutral-800 dark:text-white mb-4">🤖 AI Sentiment Analysis</h4>
                
                {/* Categories */}
                {sentimentAnalysis.categories && sentimentAnalysis.categories.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium text-sm text-neutral-700 dark:text-neutral-300 mb-3">Category Ratings</h5>
                    <div className="grid md:grid-cols-2 gap-3">
                      {sentimentAnalysis.categories.map((category, idx) => (
                        <div key={idx} className="bg-white dark:bg-white/5 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-neutral-800 dark:text-white">
                              {category.name}
                            </span>
                            <span className={`text-sm font-bold ${
                              category.rating >= 7 ? 'text-green-600 dark:text-green-400' :
                              category.rating >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {category.rating}/10
                            </span>
                          </div>
                          {category.description && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pros and Cons */}
                <div className="grid md:grid-cols-2 gap-4">
                  {sentimentAnalysis.pros && sentimentAnalysis.pros.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                        <span>👍</span> Common Pros
                      </h5>
                      <ul className="space-y-1">
                        {sentimentAnalysis.pros.slice(0, 6).map((pro, idx) => (
                          <li key={idx} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sentimentAnalysis.cons && sentimentAnalysis.cons.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                        <span>👎</span> Common Cons
                      </h5>
                      <ul className="space-y-1">
                        {sentimentAnalysis.cons.slice(0, 6).map((con, idx) => (
                          <li key={idx} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Individual Reviews */}
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                <p>No reviews available for this hotel.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-neutral-800 dark:text-white">Recent Reviews ({reviews.length})</h4>
                  <button 
                    onClick={loadReviews}
                    className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                  >
                    Refresh Reviews
                  </button>
                </div>
                
                {reviews.slice(0, 10).map((review, index) => (
                  <div key={index} className="bg-neutral-50 dark:bg-white/5 p-4 rounded-lg border border-neutral-200 dark:border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-neutral-800 dark:text-white">
                            {review.name || 'Guest'}
                          </span>
                          {review.type && (
                            <span className="text-xs bg-neutral-200 dark:bg-white/10 px-2 py-1 rounded text-neutral-600 dark:text-neutral-400">
                              {review.type}
                            </span>
                          )}
                          {review.country && (
                            <span className="text-xs text-neutral-500 dark:text-neutral-500">
                              from {review.country.toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span 
                                key={i} 
                                className={i < (review.averageScore / 2) ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {review.averageScore}/10
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          {new Date(review.date).toLocaleDateString()}
                        </p>
                        {review.source && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-600">
                            via {review.source}
                          </p>
                        )}
                      </div>
                    </div>

                    {review.headline && (
                      <h5 className="font-medium text-neutral-800 dark:text-white mb-2">
                        "{review.headline}"
                      </h5>
                    )}

                    <div className="space-y-2">
                      {review.pros && (
                        <div>
                          <span className="text-green-600 dark:text-green-400 font-medium text-sm">👍 Pros: </span>
                          <span className="text-neutral-700 dark:text-neutral-300 text-sm">{review.pros}</span>
                        </div>
                      )}
                      {review.cons && (
                        <div>
                          <span className="text-red-600 dark:text-red-400 font-medium text-sm">👎 Cons: </span>
                          <span className="text-neutral-700 dark:text-neutral-300 text-sm">{review.cons}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Header */}
            <div className="card-glass p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="heading-2 mb-2 text-neutral-800 dark:text-white">{hotelDetails.name}</h1>
                  
                  {/* Address */}
                  <div className="space-y-1 mb-3">
                    {hotelDetails.address && (
                      <p className="body text-neutral-600 dark:text-neutral-300 flex items-start gap-2">
                        <span className="flex-shrink-0">📍</span>
                        <span>
                          {hotelDetails.address}
                          {hotelDetails.city && `, ${hotelDetails.city}`}
                          {hotelDetails.country && `, ${hotelDetails.country.toUpperCase()}`}
                        </span>
                      </p>
                    )}
                    
                    {/* Map Link */}
                    {hotelDetails.location && (hotelDetails.location.latitude && hotelDetails.location.longitude) && (
                      <a 
                        href={`https://maps.google.com/?q=${hotelDetails.location.latitude},${hotelDetails.location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm flex items-center gap-1"
                      >
                        🗺️ View on Map
                      </a>
                    )}
                  </div>
                  
                  {/* Check-in/Check-out times */}
                  {hotelDetails.checkinCheckoutTimes && (
                    <div className="flex gap-4 mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <span>🕐</span>
                        <span>Check-in: {hotelDetails.checkinCheckoutTimes.checkin || hotelDetails.checkinCheckoutTimes.checkinStart}</span>
                      </div>
                      {hotelDetails.checkinCheckoutTimes.checkout && (
                        <div className="flex items-center gap-1">
                          <span>🕐</span>
                          <span>Check-out: {hotelDetails.checkinCheckoutTimes.checkout}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  {/* Star Rating (Hotel Category) */}
                  {hotelDetails.starRating && (
                    <div className="mb-3">
                      <div className="text-yellow-400 text-lg mb-1">
                        {'⭐'.repeat(Math.min(Math.floor(hotelDetails.starRating), 5))}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {hotelDetails.starRating} star hotel
                      </p>
                    </div>
                  )}
                  
                  {/* Guest Rating (Reviews) */}
                  {hotelDetails.rating && (
                    <div className="bg-primary-100 dark:bg-primary-900/30 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {hotelDetails.rating}
                        </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">/10</span>
                      </div>
                      {hotelDetails.reviewCount && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {hotelDetails.reviewCount.toLocaleString()} reviews
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hotel Images Gallery */}
            <div className="card-glass p-6">
              <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">🖼️ Hotel Gallery</h3>
              {renderImageGallery()}
            </div>

            {/* Hotel Description */}
            {hotelDetails.hotelDescription && (
              <div className="card-glass p-6">
                <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">📝 About This Hotel</h3>
                <div 
                  className="prose prose-neutral dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: hotelDetails.hotelDescription }}
                />
              </div>
            )}

            {/* AI Summary */}
            <div className="card-glass p-6">
              <h3 className="heading-3 mb-4 flex items-center gap-2 text-neutral-800 dark:text-white">
                🧠 AI Hotel Summary
              </h3>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="body text-neutral-700 dark:text-neutral-300">{summary}</p>
              </div>
            </div>

            {/* Important Information */}
            {hotelDetails.hotelImportantInformation && (
              <div className="card-glass p-6">
                <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">⚠️ Important Information</h3>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded">
                  <pre className="whitespace-pre-wrap text-sm text-amber-800 dark:text-amber-200 font-sans">
                    {hotelDetails.hotelImportantInformation}
                  </pre>
                </div>
              </div>
            )}

            {/* Facilities */}
            <div className="card-glass p-6">
              <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">🏨 Hotel Facilities</h3>
              {renderFacilities()}
            </div>

            {/* Rooms Section */}
            {hotelDetails.rooms && hotelDetails.rooms.length > 0 && (
              <div className="card-glass p-6">
                <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">🛏️ Available Rooms</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Note: Supplier room names are shown as they appear in the booking system and may contain important details.
                </p>
                {renderRooms()}
              </div>
            )}

            {/* Reviews Section */}
            <div className="card-glass p-6">
              <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">📝 Guest Reviews</h3>
              {renderReviews()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className="card-glass p-6 border border-primary-500/30">
              <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">🎯 Reserve This Hotel</h3>
              <div className="space-y-4">
                <button 
                  className="aero-btn-primary w-full py-3"
                  onClick={() => setShowBookingFlow(true)}
                >
                  🚀 Book Now
                </button>
                
                <p className="body-small text-neutral-600 dark:text-neutral-400 text-center">
                  ✨ Free cancellation • Best price guarantee
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="card-glass p-6">
              <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">📋 Quick Info</h3>
              <div className="space-y-3">
                {/* Hotel Category */}
                {hotelDetails.starRating && (
                  <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {hotelDetails.starRating} Star Hotel
                    </span>
                  </div>
                )}
                
                {/* Guest Rating */}
                {hotelDetails.rating && (
                  <div className="flex items-center gap-2">
                    <span>🌟</span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {hotelDetails.rating}/10 Guest Rating
                      {hotelDetails.reviewCount && ` (${hotelDetails.reviewCount.toLocaleString()} reviews)`}
                    </span>
                  </div>
                )}
                
                {/* Hotel Type */}
                {hotelDetails.hotelType && (
                  <div className="flex items-center gap-2">
                    <span>🏨</span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{hotelDetails.hotelType}</span>
                  </div>
                )}
                
                {/* Check-in/Check-out Times */}
                {hotelDetails.checkinCheckoutTimes && (
                  <>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        Check-in: {hotelDetails.checkinCheckoutTimes.checkin || hotelDetails.checkinCheckoutTimes.checkinStart}
                      </span>
                    </div>
                    {hotelDetails.checkinCheckoutTimes.checkout && (
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          Check-out: {hotelDetails.checkinCheckoutTimes.checkout}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Location */}
                {hotelDetails.city && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {hotelDetails.city}, {hotelDetails.country?.toUpperCase() || ''}
                    </span>
                  </div>
                )}
                
                {/* Hotel ID */}
                <div className="pt-3 border-t border-neutral-200 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span>🆔</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                      Hotel ID: {hotelDetails.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card-glass p-6">
              <h3 className="heading-3 mb-4 text-neutral-800 dark:text-white">📞 Contact</h3>
              <div className="space-y-3">
                {hotelDetails.phone && (
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <a href={`tel:${hotelDetails.phone}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      {hotelDetails.phone}
                    </a>
                  </div>
                )}
                
                {hotelDetails.email && (
                  <div className="flex items-center gap-2">
                    <span>✉️</span>
                    <a href={`mailto:${hotelDetails.email}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      {hotelDetails.email}
                    </a>
                  </div>
                )}
                
                {hotelDetails.website && (
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <a href={hotelDetails.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      <BookingFlow
        hotel={hotelDetails}
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
      />
    </>
  )
}
