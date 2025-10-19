import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function BookingFlow({ hotel, isOpen, onClose }) {
  const [step, setStep] = useState('rates') // rates, prebook, booking, confirmation
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Booking data
  const [bookingData, setBookingData] = useState({
    checkin: '',
    checkout: '',
    occupancies: [{ rooms: 1, adults: 2, children: [] }],
    currency: 'INR',
    guestNationality: 'IN'
  })
  
  const [rates, setRates] = useState([])
  const [selectedOffer, setSelectedOffer] = useState(null)
  const [prebookData, setPrebookData] = useState(null)
  const [bookingResult, setBookingResult] = useState(null)
  
  // Guest information
  const [guestInfo, setGuestInfo] = useState({
    holderName: '',
    email: '',
    phone: '',
    guests: [{ occupancyNumber: 1, firstName: '', lastName: '', email: '' }]
  })
  
  // Payment information (tokenized for PCI compliance)
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'CREDIT_CARD',
    // In production, use payment SDK to tokenize card details
    token: '', 
    holderName: ''
  })

  useEffect(() => {
    if (isOpen && hotel && step === 'rates') {
      fetchRates()
    }
  }, [isOpen, hotel, step])

  const fetchRates = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await api.post('/liteapi/rates', {
        hotelIds: [hotel.id],
        ...bookingData
      })
      
      setRates(response.data?.offers || [])
      
      if (response.data?.offers?.length === 0) {
        setError('No rooms available for the selected dates.')
      }
    } catch (err) {
      console.error('Rates fetch failed:', err)
      setError('Failed to fetch room rates. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrebook = async (offer) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await api.post('/liteapi/prebook', {
        offerId: [offer.offerId],
        usePaymentSdk: true
      })
      
      setPrebookData(response.data)
      setSelectedOffer(offer)
      
      // Check for warnings
      if (response.data.warnings?.length > 0) {
        setError(`Warning: ${response.data.warnings.join(', ')}`)
      }
      
      setStep('booking')
    } catch (err) {
      console.error('Prebook failed:', err)
      setError('Failed to reserve room. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalBooking = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await api.post('/liteapi/book', {
        prebookId: prebookData.prebookId,
        payment: paymentInfo,
        holderName: guestInfo.holderName,
        guests: guestInfo.guests
      })
      
      setBookingResult(response.data)
      setStep('confirmation')
    } catch (err) {
      console.error('Booking failed:', err)
      setError('Booking failed. Please check your information and try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingData = (key, value) => {
    setBookingData(prev => ({ ...prev, [key]: value }))
  }

  const updateGuestInfo = (key, value) => {
    setGuestInfo(prev => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/20 flex items-center justify-between">
          <div>
            <h2 className="heading-3">Book {hotel?.name}</h2>
            <p className="body-small opacity-70">Step {step === 'rates' ? 1 : step === 'prebook' ? 2 : step === 'booking' ? 3 : 4} of 4</p>
          </div>
          <button 
            onClick={onClose}
            className="aero-btn-secondary px-4 py-2"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-error-500/20 border border-error-500/30 rounded-xl p-4 mb-6">
              <p className="text-error-100">{error}</p>
            </div>
          )}

          {step === 'rates' && (
            <RatesStep
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              rates={rates}
              onSelectOffer={handlePrebook}
              loading={loading}
              onRefetch={fetchRates}
            />
          )}

          {step === 'booking' && (
            <BookingStep
              hotel={hotel}
              selectedOffer={selectedOffer}
              prebookData={prebookData}
              guestInfo={guestInfo}
              updateGuestInfo={updateGuestInfo}
              paymentInfo={paymentInfo}
              setPaymentInfo={setPaymentInfo}
              onBook={handleFinalBooking}
              loading={loading}
            />
          )}

          {step === 'confirmation' && (
            <ConfirmationStep
              bookingResult={bookingResult}
              hotel={hotel}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Sub-components for each step
function RatesStep({ bookingData, updateBookingData, rates, onSelectOffer, loading, onRefetch }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-4 mb-4">Search Dates & Guests</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="body-small font-medium block mb-2">Check-in</label>
            <input
              type="date"
              className="aero-input"
              value={bookingData.checkin}
              onChange={e => updateBookingData('checkin', e.target.value)}
            />
          </div>
          <div>
            <label className="body-small font-medium block mb-2">Check-out</label>
            <input
              type="date"
              className="aero-input"
              value={bookingData.checkout}
              onChange={e => updateBookingData('checkout', e.target.value)}
            />
          </div>
          <div>
            <label className="body-small font-medium block mb-2">Adults</label>
            <input
              type="number"
              min="1"
              className="aero-input"
              value={bookingData.occupancies[0].adults}
              onChange={e => {
                const newOccupancies = [...bookingData.occupancies]
                newOccupancies[0].adults = parseInt(e.target.value)
                updateBookingData('occupancies', newOccupancies)
              }}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={onRefetch}
              className="aero-btn-primary w-full"
              disabled={!bookingData.checkin || !bookingData.checkout}
            >
              🔍 Search Rates
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="heading-4 mb-4">Available Rooms</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="body-small mt-2">Loading rates...</p>
          </div>
        ) : rates.length === 0 ? (
          <div className="text-center py-8 opacity-70">
            <p>Enter dates to see available rooms and rates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rates.map((rate, index) => (
              <div key={index} className="glass-panel p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="body font-medium">{rate.roomType || 'Room'}</h4>
                    <p className="body-small opacity-70">{rate.boardType || 'Room Only'}</p>
                  </div>
                  <div className="text-right">
                    <div className="heading-4 text-success-400">
                      ₹{rate.price?.total || rate.totalPrice}
                    </div>
                    <p className="body-small opacity-70">per night</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {rate.cancellationPolicy?.includes('free') && (
                      <span className="px-2 py-1 bg-success-500/20 text-success-300 rounded-full">
                        Free cancellation
                      </span>
                    )}
                    {rate.priceChanged && (
                      <span className="px-2 py-1 bg-warning-500/20 text-warning-300 rounded-full">
                        Price changed
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onSelectOffer(rate)}
                    className="aero-btn-primary px-6"
                    disabled={loading}
                  >
                    Select Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookingStep({ hotel, selectedOffer, prebookData, guestInfo, updateGuestInfo, paymentInfo, setPaymentInfo, onBook, loading }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-4 mb-4">Booking Summary</h3>
        <div className="glass-panel p-4 border border-white/20">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="body font-medium">{hotel.name}</h4>
              <p className="body-small opacity-70">{selectedOffer?.roomType || 'Selected Room'}</p>
            </div>
            <div className="text-right">
              <div className="heading-4 text-success-400">
                ₹{prebookData?.totalPrice || selectedOffer?.price?.total}
              </div>
              <p className="body-small opacity-70">Total price</p>
            </div>
          </div>
          
          {prebookData?.warnings?.length > 0 && (
            <div className="mt-3 p-3 bg-warning-500/20 border border-warning-500/30 rounded-lg">
              <p className="body-small text-warning-200">
                ⚠️ {prebookData.warnings.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="heading-4 mb-4">Guest Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="body-small font-medium block mb-2">Primary Guest Name</label>
            <input
              className="aero-input"
              placeholder="Full Name"
              value={guestInfo.holderName}
              onChange={e => updateGuestInfo('holderName', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="body-small font-medium block mb-2">Email</label>
            <input
              type="email"
              className="aero-input"
              placeholder="email@example.com"
              value={guestInfo.email}
              onChange={e => updateGuestInfo('email', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="heading-4 mb-4">Payment Information</h3>
        <div className="glass-panel p-4 border border-warning-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-warning-500/20 rounded-full flex items-center justify-center">
              🔒
            </div>
            <div>
              <p className="body font-medium">Secure Payment</p>
              <p className="body-small opacity-70">Payment processing through secure tokenization</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="body-small font-medium block mb-2">Cardholder Name</label>
              <input
                className="aero-input"
                placeholder="Name on card"
                value={paymentInfo.holderName}
                onChange={e => setPaymentInfo(prev => ({...prev, holderName: e.target.value}))}
                required
              />
            </div>
            
            <p className="body-small opacity-70 text-center">
              💳 Card details will be securely processed through our payment partner
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBook}
          className="aero-btn-primary flex-1 py-3"
          disabled={loading || !guestInfo.holderName || !guestInfo.email || !paymentInfo.holderName}
        >
          {loading ? 'Processing...' : '🎯 Confirm Booking'}
        </button>
      </div>
    </div>
  )
}

function ConfirmationStep({ bookingResult, hotel, onClose }) {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-success-500/20 rounded-full flex items-center justify-center mx-auto">
        <span className="text-4xl">✅</span>
      </div>
      
      <div>
        <h3 className="heading-3 text-success-400 mb-2">Booking Confirmed!</h3>
        <p className="body opacity-70">Your reservation has been successfully processed</p>
      </div>

      <div className="glass-panel p-6 border border-success-500/30">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="opacity-70">Booking ID:</span>
            <span className="font-mono">{bookingResult?.bookingId}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Hotel:</span>
            <span>{hotel.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Confirmation Code:</span>
            <span className="font-mono">{bookingResult?.hotelConfirmationCode}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onClose} className="aero-btn-secondary flex-1">
          Close
        </button>
        <button 
          onClick={() => window.print()}
          className="aero-btn-primary flex-1"
        >
          📄 Print Confirmation
        </button>
      </div>
    </div>
  )
}