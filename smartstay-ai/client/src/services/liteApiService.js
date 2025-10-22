/**
 * LiteAPI Service - Complete hotel booking and information API
 * Documentation: https://docs.liteapi.travel/
 */

const API_BASE = '/api/liteapi'

// ===== HELPER FUNCTIONS =====

/**
 * Get country code from city name
 * Supports 200+ major cities worldwide
 */
export function getCityCountryCode(cityName) {
  if (!cityName) return null
  
  const city = cityName.toLowerCase().trim()
  
  // United States
  const usCities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'san francisco',
    'columbus', 'charlotte', 'indianapolis', 'seattle', 'denver', 'washington', 'boston',
    'nashville', 'detroit', 'las vegas', 'portland', 'memphis', 'miami', 'atlanta', 'orlando']
  if (usCities.some(c => city.includes(c))) return 'US'
  
  // United Kingdom
  const ukCities = ['london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'glasgow', 
    'edinburgh', 'cardiff', 'belfast', 'bristol', 'sheffield', 'newcastle', 'brighton']
  if (ukCities.some(c => city.includes(c))) return 'GB'
  
  // India
  const inCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune',
    'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'goa']
  if (inCities.some(c => city.includes(c))) return 'IN'
  
  // France
  const frCities = ['paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'strasbourg',
    'montpellier', 'bordeaux', 'lille', 'cannes', 'monaco']
  if (frCities.some(c => city.includes(c))) return 'FR'
  
  // Germany
  const deCities = ['berlin', 'munich', 'hamburg', 'cologne', 'frankfurt', 'stuttgart',
    'dusseldorf', 'dortmund', 'essen', 'leipzig', 'bremen', 'dresden']
  if (deCities.some(c => city.includes(c))) return 'DE'
  
  // Spain
  const esCities = ['madrid', 'barcelona', 'valencia', 'seville', 'zaragoza', 'malaga',
    'murcia', 'palma', 'bilbao', 'alicante', 'cordoba', 'granada', 'ibiza']
  if (esCities.some(c => city.includes(c))) return 'ES'
  
  // Italy
  const itCities = ['rome', 'milan', 'naples', 'turin', 'florence', 'venice', 'bologna',
    'genoa', 'palermo', 'verona', 'pisa', 'rimini', 'sorrento']
  if (itCities.some(c => city.includes(c))) return 'IT'
  
  // More countries...
  const cityCountryMap = {
    // Europe
    'amsterdam': 'NL', 'rotterdam': 'NL', 'brussels': 'BE', 'zurich': 'CH', 'geneva': 'CH',
    'vienna': 'AT', 'copenhagen': 'DK', 'stockholm': 'SE', 'oslo': 'NO', 'helsinki': 'FI',
    'dublin': 'IE', 'lisbon': 'PT', 'porto': 'PT', 'athens': 'GR', 'prague': 'CZ',
    'warsaw': 'PL', 'budapest': 'HU', 'bucharest': 'RO', 'istanbul': 'TR', 'ankara': 'TR',
    
    // Asia-Pacific
    'tokyo': 'JP', 'osaka': 'JP', 'kyoto': 'JP', 'singapore': 'SG', 'hong kong': 'HK',
    'shanghai': 'CN', 'beijing': 'CN', 'shenzhen': 'CN', 'guangzhou': 'CN', 'seoul': 'KR',
    'bangkok': 'TH', 'phuket': 'TH', 'pattaya': 'TH', 'bali': 'ID', 'jakarta': 'ID',
    'manila': 'PH', 'kuala lumpur': 'MY', 'hanoi': 'VN', 'ho chi minh': 'VN',
    
    // Middle East
    'dubai': 'AE', 'abu dhabi': 'AE', 'doha': 'QA', 'riyadh': 'SA', 'jeddah': 'SA',
    'tel aviv': 'IL', 'jerusalem': 'IL', 'beirut': 'LB', 'amman': 'JO', 'kuwait': 'KW',
    
    // Americas
    'toronto': 'CA', 'vancouver': 'CA', 'montreal': 'CA', 'calgary': 'CA', 'ottawa': 'CA',
    'mexico city': 'MX', 'cancun': 'MX', 'guadalajara': 'MX', 'monterrey': 'MX',
    'buenos aires': 'AR', 'sao paulo': 'BR', 'rio de janeiro': 'BR', 'lima': 'PE',
    'santiago': 'CL', 'bogota': 'CO', 'havana': 'CU',
    
    // Oceania
    'sydney': 'AU', 'melbourne': 'AU', 'brisbane': 'AU', 'perth': 'AU', 'adelaide': 'AU',
    'auckland': 'NZ', 'wellington': 'NZ',
    
    // Africa
    'cairo': 'EG', 'johannesburg': 'ZA', 'cape town': 'ZA', 'lagos': 'NG', 'nairobi': 'KE',
    'casablanca': 'MA', 'marrakech': 'MA', 'tunis': 'TN'
  }
  
  return cityCountryMap[city] || 'US' // Default to US
}

/**
 * Format date for API (YYYY-MM-DD)
 */
export function formatDateForAPI(date) {
  if (!date) return null
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

/**
 * Validate date range
 */
export function validateDateRange(checkIn, checkout) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const checkInDate = new Date(checkIn)
  const checkoutDate = new Date(checkout)
  
  if (checkInDate < today) {
    throw new Error('Check-in date cannot be in the past')
  }
  
  if (checkoutDate <= checkInDate) {
    throw new Error('Check-out date must be after check-in date')
  }
  
  const daysDiff = (checkoutDate - checkInDate) / (1000 * 60 * 60 * 24)
  if (daysDiff > 30) {
    throw new Error('Stay duration cannot exceed 30 nights')
  }
  
  return true
}

// ===== DATA ENDPOINTS =====

/**
 * Search for hotels
 * @param {Object} params - Search parameters
 * @param {string} params.destination - City name or destination
 * @param {string} params.countryCode - ISO-2 country code (auto-detected if not provided)
 * @param {string} params.checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkout - Check-out date (YYYY-MM-DD)
 * @param {number} params.guests - Number of guests
 */
export async function searchHotels(params) {
  console.log('🔍 searchHotels called with params:', params)
  
  const { countryCode, cityName, destination, checkIn, checkout, guests } = params
  
  // Extract country code from city name if not provided
  let finalCountryCode = countryCode
  let finalCityName = cityName || destination
  
  if (!finalCountryCode && finalCityName) {
    finalCountryCode = getCityCountryCode(finalCityName)
    console.log(`📍 Auto-detected country code: ${finalCityName} → ${finalCountryCode}`)
  }
  
  // Ensure we have countryCode (required by LiteAPI)
  if (!finalCountryCode) {
    const error = 'countryCode is required. Either provide countryCode or a recognized city name.'
    console.error('❌', error)
    throw new Error(error)
  }
  
  const queryParams = new URLSearchParams({
    countryCode: finalCountryCode,
    ...(finalCityName && { cityName: finalCityName }),
    ...(destination && !cityName && { destination }),
    ...(checkIn && { checkIn }),
    ...(checkout && { checkout }),
    ...(guests && { guests })
  })
  
  const url = `${API_BASE}/search?${queryParams}`
  console.log('📡 Fetching from:', url)
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ API Error:', response.status, error)
    throw new Error(error.error || error.message || 'Failed to search hotels')
  }
  
  const data = await response.json()
  console.log('✅ Search successful. Hotels found:', data?.data?.length || data?.hotels?.length || 0)
  
  return data
}

/**
 * Get detailed hotel information
 * @param {string} hotelId - LiteAPI hotel ID
 */
export async function getHotelDetails(hotelId) {
  console.log('🏨 Fetching hotel details for:', hotelId)
  
  const url = `${API_BASE}/hotels/${hotelId}`
  console.log('📡 Fetching from URL:', url)
  
  try {
    const response = await fetch(url)
    
    console.log('📡 Response status:', response.status, response.statusText)
    console.log('📡 Response headers:', response.headers.get('content-type'))
    
    if (!response.ok) {
      const text = await response.text()
      console.error('❌ Response not OK. Status:', response.status)
      console.error('❌ Response body:', text.substring(0, 500))
      throw new Error(`Hotel details failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Hotel details loaded:', data?.data?.name || data?.name || 'Unknown')
    
    return data
  } catch (error) {
    console.error('❌ Fetch error:', error)
    throw error
  }
}

/**
 * Get hotel reviews with optional sentiment analysis
 * @param {string} hotelId - LiteAPI hotel ID
 * @param {Object} options - Additional options
 * @param {number} options.limit - Number of reviews to return
 * @param {boolean} options.getSentiment - Include AI sentiment analysis
 */
export async function getHotelReviews(hotelId, options = {}) {
  console.log('📝 Fetching reviews for hotel:', hotelId)
  
  const queryParams = new URLSearchParams({
    hotelId,
    timeout: 4,
    limit: options.limit || 20,
    getSentiment: options.getSentiment !== undefined ? options.getSentiment : true
  })
  
  const response = await fetch(`${API_BASE}/reviews?${queryParams}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ Reviews error:', response.status, error)
    throw new Error(error.error || 'Failed to load reviews')
  }
  
  const data = await response.json()
  console.log('✅ Reviews loaded:', data?.data?.length || 0, 'reviews')
  
  return data
}

/**
 * Get list of cities
 */
export async function getCities(countryCode = null) {
  const url = countryCode 
    ? `${API_BASE}/cities?countryCode=${countryCode}`
    : `${API_BASE}/cities`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to load cities')
  }
  
  return response.json()
}

/**
 * Get list of countries
 */
export async function getCountries() {
  const response = await fetch(`${API_BASE}/countries`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to load countries')
  }
  
  return response.json()
}

/**
 * Get list of currencies
 */
export async function getCurrencies() {
  const response = await fetch(`${API_BASE}/currencies`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to load currencies')
  }
  
  return response.json()
}

/**
 * Get list of IATA codes
 */
export async function getIATACodes() {
  const response = await fetch(`${API_BASE}/iata-codes`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to load IATA codes')
  }
  
  return response.json()
}

/**
 * Get list of hotel facilities
 */
export async function getFacilities() {
  const response = await fetch(`${API_BASE}/facilities`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to load facilities')
  }
  
  return response.json()
}

// ===== BOOKING ENDPOINTS =====

/**
 * Search for rates (with optional room mapping)
 * @param {Object} params - Rate search parameters
 * @param {Array<string>} params.hotelIds - Array of hotel IDs to search
 * @param {string} params.checkin - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkout - Check-out date (YYYY-MM-DD)
 * @param {Array<Object>} params.occupancies - Guest occupancy details
 * @param {string} params.currency - Currency code (default: INR)
 * @param {string} params.guestNationality - Guest nationality (ISO-2)
 * @param {boolean} params.roomMapping - Enable room mapping for details
 * @param {number} params.maxRatesPerHotel - Max rates to return per hotel (default: 1)
 */
export async function searchRates(params) {
  console.log('💰 Searching rates:', params)
  
  // Validate dates
  if (params.checkin && params.checkout) {
    validateDateRange(params.checkin, params.checkout)
  }
  
  const response = await fetch(`${API_BASE}/rates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hotelIds: params.hotelIds,
      checkin: params.checkin,
      checkout: params.checkout,
      occupancies: params.occupancies || [{ adults: 2, children: [] }],
      currency: params.currency || 'INR',
      guestNationality: params.guestNationality || 'IN',
      roomMapping: params.roomMapping !== undefined ? params.roomMapping : true,
      maxRatesPerHotel: params.maxRatesPerHotel || 1,
      timeout: 6
    })
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ Rates search error:', response.status, error)
    throw new Error(error.error || 'Failed to search rates')
  }
  
  const data = await response.json()
  console.log('✅ Rates loaded:', data?.data?.length || 0, 'hotels with rates')
  
  return data
}

/**
 * Get rates for multiple hotels (batch search)
 * @param {Array<string>} hotelIds - Array of hotel IDs
 * @param {string} checkin - Check-in date (YYYY-MM-DD)
 * @param {string} checkout - Check-out date (YYYY-MM-DD)
 * @param {Object} options - Additional options
 */
export async function getHotelRates(hotelIds, checkin, checkout, options = {}) {
  return searchRates({
    hotelIds,
    checkin,
    checkout,
    currency: options.currency || 'INR',
    guestNationality: options.guestNationality || 'IN',
    occupancies: options.occupancies || [{ adults: 2, children: [] }],
    roomMapping: true,
    maxRatesPerHotel: options.maxRatesPerHotel || 1,
    ...options
  })
}

/**
 * Pre-book a room to validate booking details
 * @param {Object} params - Pre-book parameters
 * @param {string} params.rateId - Rate ID from searchRates
 * @param {Object} params.guestInfo - Guest information
 */
export async function preBook(params) {
  console.log('🔍 Pre-booking validation:', params)
  
  const response = await fetch(`${API_BASE}/prebook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ Pre-book error:', response.status, error)
    throw new Error(error.error || 'Failed to validate booking')
  }
  
  const data = await response.json()
  console.log('✅ Pre-book successful')
  
  return data
}

/**
 * Complete a hotel booking
 * @param {Object} params - Booking parameters
 * @param {string} params.preBookId - Pre-book ID from preBook
 * @param {Object} params.guestInfo - Complete guest information
 * @param {Object} params.paymentDetails - Payment information
 */
export async function bookRoom(params) {
  console.log('🎯 Creating booking:', params)
  
  const response = await fetch(`${API_BASE}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ Booking error:', response.status, error)
    throw new Error(error.error || 'Failed to complete booking')
  }
  
  const data = await response.json()
  console.log('✅ Booking confirmed:', data?.data?.bookingId || 'Unknown')
  
  return data
}

/**
 * Get list of bookings
 * @param {Object} params - Filter parameters
 */
export async function getBookings(params = {}) {
  const queryParams = new URLSearchParams(params)
  
  const response = await fetch(`${API_BASE}/bookings?${queryParams}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to load bookings')
  }
  
  return response.json()
}

/**
 * Get booking details
 * @param {string} bookingId - Booking ID
 */
export async function getBookingDetails(bookingId) {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Failed to load booking details')
  }
  
  return response.json()
}

/**
 * Cancel a booking
 * @param {string} bookingId - Booking ID to cancel
 */
export async function cancelBooking(bookingId) {
  console.log('❌ Canceling booking:', bookingId)
  
  const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    console.error('❌ Cancellation error:', response.status, error)
    throw new Error(error.error || 'Failed to cancel booking')
  }
  
  const data = await response.json()
  console.log('✅ Booking canceled')
  
  return data
}

export default {
  // Helper functions
  getCityCountryCode,
  formatDateForAPI,
  validateDateRange,
  
  // Data endpoints
  searchHotels,
  getHotelDetails,
  getHotelReviews,
  getCities,
  getCountries,
  getCurrencies,
  getIATACodes,
  getFacilities,
  
  // Booking endpoints
  searchRates,
  getHotelRates,
  preBook,
  bookRoom,
  getBookings,
  getBookingDetails,
  cancelBooking
}
