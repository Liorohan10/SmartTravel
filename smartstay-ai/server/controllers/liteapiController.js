import axios from 'axios';
import crypto from 'crypto';

// Environment configuration
function getLiteEnv() {
  return {
    baseURL: process.env.LITEAPI_BASE_URL || 'https://api.liteapi.travel/v3.0',
    key: process.env.LITEAPI_KEY,
    timeout: Number(process.env.LITEAPI_TIMEOUT_MS || 20000),
    useSecureAuth: process.env.LITEAPI_USE_SECURE_AUTH === 'true',
    secretKey: process.env.LITEAPI_SECRET_KEY, // For HMAC signing
  }
}

// Secure HMAC authentication for sensitive operations
function generateHMACSignature(method, path, body, timestamp, secretKey) {
  const payload = `${method}\n${path}\n${body || ''}\n${timestamp}`;
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}

// Build authentication headers (Standard or Secure)
function buildAuthHeader(env, method = 'GET', path = '', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  if (env.useSecureAuth && env.secretKey) {
    // Secure Auth with HMAC signing
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generateHMACSignature(method, path, body, timestamp, env.secretKey);
    headers['X-API-Key'] = env.key;
    headers['X-Timestamp'] = timestamp;
    headers['X-Signature'] = signature;
  } else {
    // Standard Auth
    headers['X-API-Key'] = env.key;
  }
  
  return headers;
}

// Create LiteAPI client with proper authentication
function buildClient() {
  const env = getLiteEnv();
  if (!env.key) {
    throw new Error('LiteAPI key not configured. Set LITEAPI_KEY environment variable.');
  }
  if (!env.baseURL || !/^https?:\/\//i.test(env.baseURL)) {
    throw new Error(`Invalid LiteAPI base URL: ${env.baseURL || '(empty)'}`);
  }
  
  return axios.create({
    baseURL: env.baseURL,
    timeout: env.timeout,
    headers: buildAuthHeader(env),
  });
}

// === PLACE SEARCH ENDPOINTS ===

// GET /data/places - Search for places (cities, neighborhoods, etc.)
export async function searchPlaces(req, res) {
  try {
    const client = buildClient();
    const { textQuery } = req.query;
    
    if (!textQuery) {
      return res.status(400).json({ error: 'textQuery parameter is required' });
    }
    
    const { data } = await client.get('/data/places', { 
      params: { textQuery } 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI places search error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Places search failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/places/{placeId} - Get place details by ID
export async function getPlaceDetails(req, res) {
  try {
    const client = buildClient();
    const { placeId } = req.params;
    
    const { data } = await client.get(`/data/places/${placeId}`);
    res.json(data);
  } catch (err) {
    console.error('LiteAPI place details error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Place details failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// === HOTEL SEARCH ENDPOINTS ===

// GET /data/hotel/search - Semantic hotel search by text query
export async function semanticHotelSearch(req, res) {
  try {
    const client = buildClient();
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'query parameter is required' });
    }
    
    const { data } = await client.get('/data/hotel/search', { 
      params: { query } 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI semantic search error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Semantic hotel search failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/hotels - List hotels with advanced filtering
export async function searchHotels(req, res) {
  try {
    const client = buildClient();
    const q = req.query || {};
    
    // Build comprehensive search parameters
    const params = {};
    
    // LiteAPI requires specific location criteria
    if (q.placeId) {
      params.placeId = q.placeId;
    } else if (q.latitude && q.longitude) {
      params.latitude = parseFloat(q.latitude);
      params.longitude = parseFloat(q.longitude);
      params.radius = q.radius || 50; // Default 50km radius
    } else if (q.countryCode || q.country) {
      params.countryCode = (q.countryCode || q.country || 'IN').toUpperCase();
      if (q.cityName || q.city || q.destination) {
        params.cityName = q.cityName || q.city || q.destination;
      }
    } else if (q.destination || q.city || q.cityName) {
      // Default to India if only city is provided
      params.countryCode = 'IN';
      params.cityName = q.destination || q.city || q.cityName;
    } else if (q.iataCode) {
      params.iataCode = q.iataCode;
    } else {
      // Default search - show hotels in India
      params.countryCode = 'IN';
    }
    
    // Add additional search parameters
    Object.assign(params, {
      // Hotel filters
      stars: q.stars,
      limit: q.limit || 50,
      offset: q.offset || 0,
      
      // AI-powered search
      aiSearch: q.aiSearch, // Natural language search
      
      // Advanced filtering
      facilities: q.facilities ? q.facilities.split(',') : undefined,
      strictFacilityFiltering: q.strictFacilityFiltering === 'true',
      
      // Sorting
      sort: q.sort || 'popularity', // popularity, price_asc, price_desc, distance, rating
      
      // Localization
      language: q.language || 'en',
      currency: q.currency || 'INR',
    });
    
    // Remove undefined values
    Object.keys(params).forEach(key => 
      params[key] === undefined && delete params[key]
    );
    
    // Debug logging
    console.log('LiteAPI search params:', JSON.stringify(params, null, 2));
    
    const { data } = await client.get('/data/hotels', { params });
    
    // Transform response for consistent frontend usage
    const hotels = Array.isArray(data?.data) ? data.data : 
                   Array.isArray(data?.hotels) ? data.hotels : 
                   Array.isArray(data) ? data : [];
                   
    const transformedHotels = hotels.map(hotel => ({
      id: hotel.id || hotel.hotelId,
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      stars: hotel.stars,
      rating: hotel.rating,
      main_photo: hotel.main_photo,
      images: hotel.images || [],
      facilities: hotel.facilities || [],
      currency: hotel.currency,
      description: hotel.description,
      raw: hotel // Keep original data for detailed operations
    }));
    
    res.json({ 
      hotels: transformedHotels, 
      total: data?.total || transformedHotels.length,
      page: data?.page || 0,
      limit: data?.limit || params.limit 
    });
  } catch (err) {
    console.error('LiteAPI hotels search error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Hotels search failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// === HOTEL DETAILS & REVIEWS ===

// GET /data/hotel - Get detailed hotel information
export async function getHotelDetails(req, res) {
  try {
    const client = buildClient();
    const { id } = req.params;
    
    const { data } = await client.get('/data/hotel', { 
      params: { hotelId: id } 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI hotel details error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Hotel details failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/reviews - Get hotel reviews with AI sentiment analysis
export async function getHotelReviews(req, res) {
  try {
    const client = buildClient();
    const { hotelId, limit = 10, getSentiment = 'true' } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'hotelId parameter is required' });
    }
    
    const { data } = await client.get('/data/reviews', { 
      params: { 
        hotelId, 
        limit: parseInt(limit),
        getSentiment: getSentiment === 'true'
      } 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI reviews error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Hotel reviews failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// === RATES & AVAILABILITY ===

// POST /hotels/rates - Get detailed room rates and availability
export async function getHotelRates(req, res) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    
    // Use secure auth for rate queries if configured
    const headers = env.useSecureAuth ? 
      buildAuthHeader(env, 'POST', '/hotels/rates', JSON.stringify(req.body)) : 
      buildAuthHeader(env);
    
    const requestBody = {
      hotelIds: req.body.hotelIds || [],
      checkin: req.body.checkin,
      checkout: req.body.checkout,
      currency: req.body.currency || 'INR',
      guestNationality: req.body.guestNationality || 'IN',
      occupancies: req.body.occupancies || [{ rooms: 1, adults: 2, children: [] }],
      ...req.body // Allow additional parameters
    };
    
    const { data } = await client.post('/hotels/rates', requestBody, { headers });
    
    // Process response to include price change indicators
    if (data && data.offers) {
      data.offers = data.offers.map(offer => ({
        ...offer,
        priceChanged: offer.priceDifferencePercent > 0,
        cancellationChanged: offer.cancellationChanged || false,
        boardChanged: offer.boardChanged || false
      }));
    }
    
    res.json(data);
  } catch (err) {
    console.error('LiteAPI rates error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Hotel rates failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// POST /hotels/min-rates - Get minimum available rates
export async function getMinRates(req, res) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    
    const headers = env.useSecureAuth ? 
      buildAuthHeader(env, 'POST', '/hotels/min-rates', JSON.stringify(req.body)) : 
      buildAuthHeader(env);
    
    const { data } = await client.post('/hotels/min-rates', req.body, { headers });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI min rates error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Min rates failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// === BOOKING WORKFLOW ===

// POST /rates/prebook - Pre-book to lock rates with verification
export async function prebookRate(req, res) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    
    const headers = env.useSecureAuth ? 
      buildAuthHeader(env, 'POST', '/rates/prebook', JSON.stringify(req.body)) : 
      buildAuthHeader(env);
    
    const requestBody = {
      offerId: req.body.offerId,
      usePaymentSdk: req.body.usePaymentSdk || false,
      ...req.body
    };
    
    const { data } = await client.post('/rates/prebook', requestBody, { headers });
    
    // Check for important prebook warnings
    const warnings = [];
    if (data.priceDifferencePercent > 5) {
      warnings.push(`Price changed by ${data.priceDifferencePercent}%`);
    }
    if (data.cancellationChanged) {
      warnings.push('Cancellation policy has changed');
    }
    if (data.boardChanged) {
      warnings.push('Board type has changed');
    }
    
    res.json({ ...data, warnings });
  } catch (err) {
    console.error('LiteAPI prebook error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Prebook failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// POST /rates/book - Finalize booking
export async function finalizeBooking(req, res) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    
    const headers = env.useSecureAuth ? 
      buildAuthHeader(env, 'POST', '/rates/book', JSON.stringify(req.body)) : 
      buildAuthHeader(env);
    
    const requestBody = {
      prebookId: req.body.prebookId,
      payment: req.body.payment, // Should be tokenized for PCI compliance
      holderName: req.body.holderName,
      guests: req.body.guests,
      ...req.body
    };
    
    const { data } = await client.post('/rates/book', requestBody, { headers });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI booking error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Booking failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// === BOOKING MANAGEMENT ===

// GET /bookings - List all bookings
export async function listBookings(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/bookings', { 
      params: req.query 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI bookings list error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Bookings list failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /bookings/{bookingId} - Get booking details
export async function getBookingDetails(req, res) {
  try {
    const client = buildClient();
    const { bookingId } = req.params;
    
    const { data } = await client.get(`/bookings/${bookingId}`);
    res.json(data);
  } catch (err) {
    console.error('LiteAPI booking details error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Booking details failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// PUT /bookings/{bookingId} - Cancel booking
export async function cancelBooking(req, res) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    const { bookingId } = req.params;
    
    const headers = env.useSecureAuth ? 
      buildAuthHeader(env, 'PUT', `/bookings/${bookingId}`, JSON.stringify(req.body)) : 
      buildAuthHeader(env);
    
    const { data } = await client.put(`/bookings/${bookingId}`, req.body, { headers });
    
    // Process cancellation response
    const result = {
      ...data,
      canCancel: !data.error,
      refundAmount: data.refund_amount || 0,
      cancellationFee: data.cancellation_fee || 0,
      isNonRefundable: data.error?.includes('NRFN') || false
    };
    
    res.json(result);
  } catch (err) {
    console.error('LiteAPI cancel booking error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Booking cancellation failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// === STATIC REFERENCE DATA ===

// GET /data/currencies - List supported currencies
export async function getCurrencies(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/data/currencies');
    res.json(data);
  } catch (err) {
    console.error('LiteAPI currencies error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Currencies fetch failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/countries - List all countries
export async function getCountries(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/data/countries');
    res.json(data);
  } catch (err) {
    console.error('LiteAPI countries error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Countries fetch failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/cities - List cities in a country
export async function getCities(req, res) {
  try {
    const client = buildClient();
    const { countryCode } = req.query;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'countryCode parameter is required' });
    }
    
    const { data } = await client.get('/data/cities', { 
      params: { countryCode } 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI cities error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Cities fetch failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/facilities - List hotel facilities
export async function getFacilities(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/data/facilities');
    res.json(data);
  } catch (err) {
    console.error('LiteAPI facilities error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Facilities fetch failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/hotelTypes - List hotel types
export async function getHotelTypes(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/data/hotelTypes');
    res.json(data);
  } catch (err) {
    console.error('LiteAPI hotel types error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Hotel types fetch failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/chains - List hotel chains
export async function getHotelChains(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/data/chains');
    res.json(data);
  } catch (err) {
    console.error('LiteAPI chains error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Hotel chains fetch failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /data/iataCodes - List IATA codes
export async function getIataCodes(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/data/iataCodes');
    res.json(data);
  } catch (err) {
    console.error('LiteAPI IATA codes error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'IATA codes fetch failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// === ANALYTICS ENDPOINTS ===

// GET /analytics/weekly - Weekly analytics data
export async function getWeeklyAnalytics(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/analytics/weekly', { 
      params: req.query 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI weekly analytics error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Weekly analytics failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /analytics/market - Market analytics data
export async function getMarketAnalytics(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/analytics/market', { 
      params: req.query 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI market analytics error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Market analytics failed', 
      detail: err.response?.data || err.message 
    });
  }
}

// GET /analytics/detailed - Detailed analytics data
export async function getDetailedAnalytics(req, res) {
  try {
    const client = buildClient();
    const { data } = await client.get('/analytics/detailed', { 
      params: req.query 
    });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI detailed analytics error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: 'Detailed analytics failed', 
      detail: err.response?.data || err.message 
    });
  }
}
