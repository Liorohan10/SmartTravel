/**
 * LiteAPI Controller - Implements all LiteAPI v3.0 endpoints
 * Based on the official LiteAPI Postman Collection
 * 
 * API Documentation: https://api.liteapi.travel/v3.0
 * Base URL: https://api.liteapi.travel/v3.0
 * Authentication: X-API-Key header with API key
 */

import axios from 'axios';

function getLiteEnv() {
  return {
    baseURL: process.env.LITEAPI_BASE_URL || 'https://api.liteapi.travel/v3.0',
    key: process.env.LITEAPI_KEY,
    timeout: Number(process.env.LITEAPI_TIMEOUT_MS || 20000),
    authHeaderName: process.env.LITEAPI_AUTH_HEADER_NAME || 'X-API-Key',
    authScheme: (process.env.LITEAPI_AUTH_SCHEME || 'apikey').toLowerCase(),
  }
}

function buildAuthHeader(env) {
  if (env.authScheme === 'bearer') return { [env.authHeaderName]: `Bearer ${env.key}` };
  if (env.authScheme === 'apikey') return { [env.authHeaderName]: env.key };
  return {}; // none
}

function buildClient() {
  const env = getLiteEnv();
  if (!env.baseURL || !/^https?:\/\//i.test(env.baseURL)) {
    throw new Error(`Invalid LiteAPI base URL: ${env.baseURL || '(empty)'}`);
  }
  return axios.create({
    baseURL: env.baseURL,
    timeout: env.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...buildAuthHeader(env),
    },
  });
}

// =============================================================================
// DATA ENDPOINTS - Hotel, City, Country, Currency, Facilities data
// =============================================================================

/**
 * GET /data/hotel - Get the details of a hotel
 * Required params: hotelId
 * Optional params: timeout
 */
export async function getHotelDetails(req, res) {
  try {
    const client = buildClient();
    const { hotelId } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'hotelId is required' });
    }

    const params = {
      hotelId,
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get('/data/hotel', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI hotel details error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to get hotel details', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /data/hotels - Retrieve a list of hotels
 * Required params: countryCode
 * Optional params: cityName, offset, limit, longitude, latitude, distance, timeout
 */
export async function listHotels(req, res) {
  try {
    const client = buildClient();
    const { countryCode } = req.query;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'countryCode is required' });
    }

    const params = {
      countryCode,
      cityName: req.query.cityName,
      offset: req.query.offset || 0,
      limit: req.query.limit || 100,
      longitude: req.query.longitude,
      latitude: req.query.latitude,
      distance: req.query.distance,
      timeout: req.query.timeout || 1.5
    };

    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const { data } = await client.get('/data/hotels', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI list hotels error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to list hotels', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /data/reviews - Get the reviews of a hotel
 * Required params: hotelId
 * Optional params: limit, timeout
 */
export async function getHotelReviews(req, res) {
  try {
    const client = buildClient();
    const { hotelId } = req.query;
    
    if (!hotelId) {
      return res.status(400).json({ error: 'hotelId is required' });
    }

    const params = {
      hotelId,
      limit: req.query.limit || 100,
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get('/data/reviews', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI reviews error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to get hotel reviews', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /data/cities - List the cities of a country
 * Required params: countryCode (ISO-2 format)
 * Optional params: timeout
 */
export async function listCities(req, res) {
  try {
    const client = buildClient();
    const { countryCode } = req.query;
    
    if (!countryCode) {
      return res.status(400).json({ error: 'countryCode is required' });
    }

    const params = {
      countryCode,
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get('/data/cities', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI cities error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to list cities', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /data/countries - List of countries
 * Optional params: timeout
 */
export async function listCountries(req, res) {
  try {
    const client = buildClient();
    const params = {
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get('/data/countries', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI countries error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to list countries', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /data/currencies - List of available currencies
 * Optional params: timeout
 */
export async function listCurrencies(req, res) {
  try {
    const client = buildClient();
    const params = {
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get('/data/currencies', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI currencies error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to list currencies', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /data/facilities - List of available hotel facilities
 * Optional params: timeout
 */
export async function listFacilities(req, res) {
  try {
    const client = buildClient();
    const params = {
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get('/data/facilities', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI facilities error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to list facilities', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /data/iata - Get IATA code details
 * Required params: iataCode
 * Optional params: timeout
 */
export async function getIATADetails(req, res) {
  try {
    const client = buildClient();
    const { iataCode } = req.query;
    
    if (!iataCode) {
      return res.status(400).json({ error: 'iataCode is required' });
    }

    const params = {
      iataCode,
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get('/data/iata', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI IATA error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to get IATA details', 
      detail: err.response?.data || err.message 
    });
  }
}

// =============================================================================
// RATES ENDPOINTS - Rate availability and booking
// =============================================================================

/**
 * GET /rates/minimumRateAvailability - Search minimum rate availability
 * Required params: hotelIds, checkin, checkout, adults
 * Optional params: guestNationality, currency, timeout
 */
export async function getMinimumRates(req, res) {
  try {
    const client = buildClient();
    const { hotelIds, checkin, checkout, adults } = req.query;
    
    if (!hotelIds || !checkin || !checkout || !adults) {
      return res.status(400).json({ 
        error: 'hotelIds, checkin, checkout, and adults are required' 
      });
    }

    const params = {
      hotelIds,
      checkin,
      checkout,
      adults,
      guestNationality: req.query.guestNationality,
      currency: req.query.currency || 'USD',
      timeout: req.query.timeout || 1.5
    };

    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const { data } = await client.get('/rates/minimumRateAvailability', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI minimum rates error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to get minimum rates', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /rates/rateAvailability - Get detailed rate availability
 * Required params: hotelId, checkin, checkout, adults
 * Optional params: children, guestNationality, currency, timeout
 */
export async function getRateAvailability(req, res) {
  try {
    const client = buildClient();
    const { hotelId, checkin, checkout, adults } = req.query;
    
    if (!hotelId || !checkin || !checkout || !adults) {
      return res.status(400).json({ 
        error: 'hotelId, checkin, checkout, and adults are required' 
      });
    }

    const params = {
      hotelId,
      checkin,
      checkout,
      adults,
      children: req.query.children,
      guestNationality: req.query.guestNationality,
      currency: req.query.currency || 'USD',
      timeout: req.query.timeout || 1.5
    };

    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const { data } = await client.get('/rates/rateAvailability', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI rate availability error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to get rate availability', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * POST /rates/prebook - Prebook a rate before final booking
 * Required body params: rateId
 */
export async function prebookRate(req, res) {
  try {
    const client = buildClient();
    const { rateId } = req.body;
    
    if (!rateId) {
      return res.status(400).json({ error: 'rateId is required' });
    }

    const { data } = await client.post('/rates/prebook', req.body);
    res.json(data);
  } catch (err) {
    console.error('LiteAPI prebook error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to prebook rate', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * POST /rates/book - Confirm a booking
 * Required body params: prebookId, holder, guests, payment
 */
export async function bookRate(req, res) {
  try {
    const client = buildClient();
    const { prebookId, holder, guests, payment } = req.body;
    
    if (!prebookId || !holder || !guests || !payment) {
      return res.status(400).json({ 
        error: 'prebookId, holder, guests, and payment are required' 
      });
    }

    const { data } = await client.post('/rates/book', req.body);
    res.json(data);
  } catch (err) {
    console.error('LiteAPI book error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to book rate', 
      detail: err.response?.data || err.message 
    });
  }
}

// =============================================================================
// BOOKINGS ENDPOINTS - Manage bookings
// =============================================================================

/**
 * GET /bookings - List bookings
 * Optional params: clientReference, timeout
 */
export async function listBookings(req, res) {
  try {
    const client = buildClient();
    const params = {
      clientReference: req.query.clientReference,
      timeout: req.query.timeout || 1.5
    };

    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const { data } = await client.get('/bookings', { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI list bookings error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to list bookings', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * GET /bookings/:bookingId - Retrieve a booking
 * Required params: bookingId (in URL)
 * Optional params: timeout
 */
export async function getBooking(req, res) {
  try {
    const client = buildClient();
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const params = {
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.get(`/bookings/${bookingId}`, { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI get booking error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to get booking', 
      detail: err.response?.data || err.message 
    });
  }
}

/**
 * PUT /bookings/:bookingId - Cancel a booking
 * Required params: bookingId (in URL)
 * Optional params: timeout
 */
export async function cancelBooking(req, res) {
  try {
    const client = buildClient();
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const params = {
      timeout: req.query.timeout || 1.5
    };

    const { data } = await client.put(`/bookings/${bookingId}`, {}, { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI cancel booking error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ 
      error: 'Failed to cancel booking', 
      detail: err.response?.data || err.message 
    });
  }
}
