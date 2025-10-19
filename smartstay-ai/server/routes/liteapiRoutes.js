import { Router } from 'express';
import { 
  // Place search
  searchPlaces, getPlaceDetails,
  // Hotel search
  semanticHotelSearch, searchHotels,
  // Hotel details & reviews
  getHotelDetails, getHotelReviews,
  // Rates & availability
  getHotelRates, getMinRates,
  // Booking workflow
  prebookRate, finalizeBooking,
  // Booking management
  listBookings, getBookingDetails, cancelBooking,
  // Static reference data
  getCurrencies, getCountries, getCities, getFacilities,
  getHotelTypes, getHotelChains, getIataCodes,
  // Analytics
  getWeeklyAnalytics, getMarketAnalytics, getDetailedAnalytics
} from '../controllers/liteapiController.js';
import axios from 'axios';

const router = Router();

// === PLACE SEARCH ROUTES ===
router.get('/places', searchPlaces);
router.get('/places/:placeId', getPlaceDetails);

// === HOTEL SEARCH ROUTES ===
router.get('/hotels/semantic-search', semanticHotelSearch);
router.get('/hotels/search', searchHotels); // Main search endpoint
router.get('/search', searchHotels); // Legacy compatibility

// === HOTEL DETAILS & REVIEWS ===
router.get('/hotels/:id', getHotelDetails);
router.get('/reviews', getHotelReviews);

// === RATES & AVAILABILITY ===
router.post('/rates', getHotelRates);
router.post('/min-rates', getMinRates);

// === BOOKING WORKFLOW ===
router.post('/prebook', prebookRate);
router.post('/book', finalizeBooking);

// === BOOKING MANAGEMENT ===
router.get('/bookings', listBookings);
router.get('/bookings/:bookingId', getBookingDetails);
router.put('/bookings/:bookingId', cancelBooking);

// === STATIC REFERENCE DATA ===
router.get('/data/currencies', getCurrencies);
router.get('/data/countries', getCountries);
router.get('/data/cities', getCities);
router.get('/data/facilities', getFacilities);
router.get('/data/hotel-types', getHotelTypes);
router.get('/data/chains', getHotelChains);
router.get('/data/iata-codes', getIataCodes);

// === ANALYTICS ===
router.get('/analytics/weekly', getWeeklyAnalytics);
router.get('/analytics/market', getMarketAnalytics);
router.get('/analytics/detailed', getDetailedAnalytics);

// === HEALTH CHECK ===
// Health check to verify LiteAPI configuration and connectivity
router.get('/health', async (req, res) => {
	try {
		const base = process.env.LITEAPI_BASE_URL;
		const key = process.env.LITEAPI_KEY;
		
		// Use new authentication system
		const headers = { 
			'Content-Type': 'application/json',
			'X-API-Key': key  // Standard LiteAPI authentication
		};
		
		await axios.get(base, { headers, timeout: 5000 });
		res.json({ 
			ok: true, 
			baseSet: !!base, 
			keySet: !!key,
			useSecureAuth: process.env.LITEAPI_USE_SECURE_AUTH === 'true'
		});
	} catch (e) {
		res.status(500).json({ 
			ok: false, 
			error: e.message, 
			status: e.response?.status, 
			data: e.response?.data 
		});
	}
});

export default router;
