/**
 * LiteAPI Routes - All LiteAPI v3.0 endpoints
 * Based on the official LiteAPI Postman Collection
 */

import { Router } from 'express';
import {
  // Data endpoints
  getHotelDetails,
  listHotels,
  getHotelReviews,
  listCities,
  listCountries,
  listCurrencies,
  listFacilities,
  getIATADetails,
  // Rates endpoints
  getMinimumRates,
  getRateAvailability,
  prebookRate,
  bookRate,
  // Bookings endpoints
  listBookings,
  getBooking,
  cancelBooking
} from '../controllers/liteapiController.js';

const router = Router();

// =============================================================================
// DATA ENDPOINTS - Hotel, City, Country, Currency, Facilities data
// =============================================================================

// GET /data/hotel - Get the details of a hotel
router.get('/data/hotel', getHotelDetails);

// GET /data/hotels - Retrieve a list of hotels
router.get('/data/hotels', listHotels);

// GET /data/reviews - Get the reviews of a hotel
router.get('/data/reviews', getHotelReviews);

// GET /data/cities - List the cities of a country
router.get('/data/cities', listCities);

// GET /data/countries - List of countries
router.get('/data/countries', listCountries);

// GET /data/currencies - List of available currencies
router.get('/data/currencies', listCurrencies);

// GET /data/facilities - List of available hotel facilities
router.get('/data/facilities', listFacilities);

// GET /data/iata - Get IATA code details
router.get('/data/iata', getIATADetails);

// =============================================================================
// RATES ENDPOINTS - Rate availability and booking
// =============================================================================

// GET /rates/minimumRateAvailability - Search minimum rate availability
router.get('/rates/minimumRateAvailability', getMinimumRates);

// GET /rates/rateAvailability - Get detailed rate availability
router.get('/rates/rateAvailability', getRateAvailability);

// POST /rates/prebook - Prebook a rate before final booking
router.post('/rates/prebook', prebookRate);

// POST /rates/book - Confirm a booking
router.post('/rates/book', bookRate);

// =============================================================================
// BOOKINGS ENDPOINTS - Manage bookings
// =============================================================================

// GET /bookings - List bookings
router.get('/bookings', listBookings);

// GET /bookings/:bookingId - Retrieve a booking
router.get('/bookings/:bookingId', getBooking);

// PUT /bookings/:bookingId - Cancel a booking
router.put('/bookings/:bookingId', cancelBooking);

// =============================================================================
// HEALTH CHECK
// =============================================================================

// Health check to verify LiteAPI configuration
router.get('/health', async (req, res) => {
  try {
    const baseURL = process.env.LITEAPI_BASE_URL || 'https://api.liteapi.travel/v3.0';
    const key = process.env.LITEAPI_KEY;
    const authHeaderName = process.env.LITEAPI_AUTH_HEADER_NAME || 'X-API-Key';
    
    res.json({ 
      ok: true, 
      baseURL,
      keyConfigured: !!key,
      authHeaderName
    });
  } catch (e) {
    res.status(500).json({ 
      ok: false, 
      error: e.message 
    });
  }
});

export default router;
