import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import BookingFlow from '../components/BookingFlow'

export default function HotelDetails() {
  const { id } = useParams()
  const [hotelDetails, setHotelDetails] = useState(null)
  const [reviews, setReviews] = useState([])
  const [sentiment, setSentiment] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)

  useEffect(() => {
    async function fetchHotelData() {
      setLoading(true)
      try {
        // Fetch detailed hotel information from LiteAPI
        const { data } = await api.get(`/liteapi/hotels/${id}`)
        setHotelDetails(data.data || data)
        
        // Fetch AI summary
        try {
          const { data: summaryData } = await api.post('/gemini/summarize-hotel', { 
            hotel: data.data 
          })
          setSummary(summaryData.summary)
        } catch {
          setSummary('AI summary unavailable.')
        }
        
        // Fetch reviews with sentiment analysis
        loadReviews()
      } catch (error) {
        console.error('Failed to load hotel details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHotelData()
  }, [id])

  const loadReviews = async () => {
    setReviewsLoading(true)
    try {
      const { data } = await api.get('/liteapi/reviews', { 
        params: { hotelId: id, limit: 20, getSentiment: true } 
      })
      setReviews(data.data || [])
      setSentiment(data.sentiment)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setReviewsLoading(false)
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
        <p className="heading-2 text-red-600 dark:text-red-400 mb-2">Hotel not found</p>
        <p className="body text-neutral-600 dark:text-neutral-300">The requested hotel could not be found.</p>
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
    const facilities = hotelDetails.facilities || []
    if (!facilities.length) return null

    const facilityIcons = {
      'pool': '🏊', 'spa': '💆', 'wifi': '📶', 'gym': '💪', 
      'restaurant': '🍽️', 'bar': '🍸', 'parking': '🚗', 
      'ac': '❄️', 'room service': '🛎️', 'breakfast': '🥞',
      'laundry': '👔', 'concierge': '🎩', 'elevator': '🛗',
      'business': '💼', 'fitness': '🏋️', 'internet': '🌐'
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {facilities.map((facility, index) => {
          const icon = Object.keys(facilityIcons).find(key => 
            facility.toLowerCase().includes(key)
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
            {sentiment && (
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700">
                <h4 className="font-semibold text-neutral-800 dark:text-white mb-2">🤖 AI Review Analysis</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {sentiment.positive && (
                    <div>
                      <span className="text-green-600 dark:text-green-400 font-medium">👍 Positive: </span>
                      <span className="text-neutral-700 dark:text-neutral-300">{sentiment.positive}</span>
                    </div>
                  )}
                  {sentiment.negative && (
                    <div>
                      <span className="text-red-600 dark:text-red-400 font-medium">👎 Negative: </span>
                      <span className="text-neutral-700 dark:text-neutral-300">{sentiment.negative}</span>
                    </div>
                  )}
                  {sentiment.overall && (
                    <div className="md:col-span-2">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">📊 Overall: </span>
                      <span className="text-neutral-700 dark:text-neutral-300">{sentiment.overall}</span>
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
                  <p className="body text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                    📍 {hotelDetails.address?.full || hotelDetails.location || 'Location not specified'}
                  </p>
                  
                  {/* Check-in/Check-out times */}
                  {hotelDetails.checkinCheckoutTimes && (
                    <div className="flex gap-4 mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <span>🕐</span>
                        <span>Check-in: {hotelDetails.checkinCheckoutTimes.checkin}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🕐</span>
                        <span>Check-out: {hotelDetails.checkinCheckoutTimes.checkout}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  {(hotelDetails.rating || hotelDetails.stars) && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="heading-4 text-neutral-800 dark:text-white">
                        {hotelDetails.rating || hotelDetails.stars}
                        {(hotelDetails.rating || hotelDetails.stars) > 5 && (
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">/10</span>
                        )}
                      </span>
                    </div>
                  )}
                  {(hotelDetails.stars || hotelDetails.rating) && (
                    <div className="text-yellow-400">
                      {'⭐'.repeat(Math.min(Math.floor(hotelDetails.stars || hotelDetails.rating), 5))}
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
                {hotelDetails.hotelType && (
                  <div className="flex items-center gap-2">
                    <span>🏨</span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{hotelDetails.hotelType}</span>
                  </div>
                )}
                
                {hotelDetails.checkinCheckoutTimes && (
                  <>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        Check-in: {hotelDetails.checkinCheckoutTimes.checkin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        Check-out: {hotelDetails.checkinCheckoutTimes.checkout}
                      </span>
                    </div>
                  </>
                )}
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
