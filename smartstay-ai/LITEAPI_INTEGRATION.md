# LiteAPI Integration Documentation

## Overview

SmartTravel AI now includes comprehensive integration with LiteAPI v3.0, providing full hotel search, booking, and management capabilities. This document outlines all available endpoints and their usage.

## Authentication

The system supports two authentication modes:

### Standard Authentication (Default)
- Uses `X-API-Key` header with your LiteAPI key
- Set `LITEAPI_USE_SECURE_AUTH=false` (default)

### Secure Authentication (Recommended for Production)
- Uses HMAC-SHA256 signed requests for enhanced security
- Set `LITEAPI_USE_SECURE_AUTH=true`
- Requires `LITEAPI_SECRET_KEY` for HMAC signing

## Available Endpoints

### Place Search
- `GET /api/liteapi/places?textQuery=mumbai` - Search places for autocomplete
- `GET /api/liteapi/places/{placeId}` - Get place details by ID

### Hotel Search & Discovery
- `GET /api/liteapi/hotels/search` - Main hotel search with advanced filtering
- `GET /api/liteapi/hotels/semantic-search?query=luxury beachfront` - AI-powered semantic search
- `GET /api/liteapi/hotels/{id}` - Get detailed hotel information

### Reviews & Analytics
- `GET /api/liteapi/reviews?hotelId={id}&getSentiment=true` - Hotel reviews with AI sentiment analysis

### Rates & Availability
- `POST /api/liteapi/rates` - Get detailed room rates and availability
- `POST /api/liteapi/min-rates` - Get minimum available rates for pricing display

### Booking Workflow
- `POST /api/liteapi/prebook` - Pre-book to lock rates (with verification)
- `POST /api/liteapi/book` - Finalize booking with payment

### Booking Management
- `GET /api/liteapi/bookings` - List all bookings
- `GET /api/liteapi/bookings/{bookingId}` - Get booking details
- `PUT /api/liteapi/bookings/{bookingId}` - Cancel booking

### Reference Data
- `GET /api/liteapi/data/currencies` - Supported currencies
- `GET /api/liteapi/data/countries` - All countries
- `GET /api/liteapi/data/cities?countryCode=IN` - Cities in a country
- `GET /api/liteapi/data/facilities` - Hotel facilities list
- `GET /api/liteapi/data/hotel-types` - Hotel types
- `GET /api/liteapi/data/chains` - Hotel chains
- `GET /api/liteapi/data/iata-codes` - Airport/city IATA codes

### Analytics (Business Intelligence)
- `GET /api/liteapi/analytics/weekly` - Weekly analytics data
- `GET /api/liteapi/analytics/market` - Market analytics
- `GET /api/liteapi/analytics/detailed` - Detailed analytics

## Advanced Search Features

### AI-Powered Search
Use natural language queries for intelligent hotel matching:

```javascript
// Client-side usage
const searchParams = {
  aiSearch: "luxury beachfront hotel with spa near Mumbai airport for business trip",
  checkin: "2024-12-01",
  checkout: "2024-12-05",
  adults: 2
}
```

### Advanced Filtering
Support for comprehensive filtering options:

```javascript
const searchParams = {
  cityName: "Mumbai",
  countryCode: "IN",
  facilities: ["pool", "spa", "wifi"],
  strictFacilityFiltering: true, // Must have ALL facilities
  stars: 5,
  sort: "price_asc", // popularity, price_asc, price_desc, distance, rating
  currency: "INR",
  language: "en"
}
```

### Place Autocomplete
Integrated place search with autocomplete suggestions:

```javascript
// Debounced place search in SearchBar component
const searchPlaces = async (query) => {
  const { data } = await api.get('/liteapi/places', { 
    params: { textQuery: query } 
  })
  setPlaceSuggestions(data?.data || [])
}
```

## Booking Flow Implementation

### 1. Search & Display Hotels
```javascript
// Enhanced hotel search with comprehensive data transformation
const { data } = await api.get('/liteapi/hotels/search', { params })
const hotels = data.hotels.map(hotel => ({
  id: hotel.id,
  name: hotel.name,
  location: hotel.address?.full || hotel.city,
  stars: hotel.stars,
  rating: hotel.rating,
  facilities: hotel.facilities,
  main_photo: hotel.main_photo,
  currency: hotel.currency
}))
```

### 2. Get Rates & Availability
```javascript
// Fetch rates with occupancy details
const ratesRequest = {
  hotelIds: [selectedHotelId],
  checkin: "2024-12-01",
  checkout: "2024-12-05",
  currency: "INR",
  guestNationality: "IN",
  occupancies: [{ rooms: 1, adults: 2, children: [] }]
}

const { data } = await api.post('/liteapi/rates', ratesRequest)
// Response includes price change warnings and cancellation policy changes
```

### 3. Pre-book (Rate Verification)
```javascript
// Lock rates and verify pricing
const prebookRequest = {
  offerId: [selectedOffer.offerId],
  usePaymentSdk: true
}

const { data } = await api.post('/liteapi/prebook', prebookRequest)
// Check data.warnings for price changes, cancellation policy updates
```

### 4. Finalize Booking
```javascript
// Complete booking with payment and guest details
const bookingRequest = {
  prebookId: prebookData.prebookId,
  payment: {
    method: "CREDIT_CARD",
    token: "tokenized_card_data", // Use payment SDK for PCI compliance
    holderName: "John Doe"
  },
  holderName: "John Doe",
  guests: [
    { 
      occupancyNumber: 1, 
      firstName: "John", 
      lastName: "Doe", 
      email: "john@example.com" 
    }
  ]
}

const { data } = await api.post('/liteapi/book', bookingRequest)
// Returns bookingId, hotelConfirmationCode, and booking status
```

## Security Best Practices

### 1. API Key Protection
- Never expose LiteAPI keys in client-side code
- All API calls are proxied through the Express backend
- Environment variables used for secure key storage

### 2. Payment Security (PCI Compliance)
- Payment card data should be tokenized using payment SDKs
- Never store or log sensitive payment information
- Use HTTPS for all payment-related communications

### 3. HMAC Authentication (Production)
For sensitive operations in production:

```javascript
// Automatically handled by the controller when LITEAPI_USE_SECURE_AUTH=true
const signature = generateHMACSignature(method, path, body, timestamp, secretKey)
headers['X-Signature'] = signature
headers['X-Timestamp'] = timestamp
```

## Error Handling

The system includes comprehensive error handling:

### Rate Limiting & Timeouts
- Default timeout: 20 seconds (configurable via `LITEAPI_TIMEOUT_MS`)
- Automatic retry logic for transient failures
- Graceful degradation when services are unavailable

### Price Change Handling
```javascript
// Prebook response includes price change indicators
if (prebookData.priceDifferencePercent > 5) {
  // Warn user about significant price changes
  showPriceChangeWarning(prebookData.priceDifferencePercent)
}

if (prebookData.cancellationChanged) {
  // Alert user about cancellation policy changes
  showCancellationPolicyChange()
}
```

### Booking Failure Recovery
```javascript
// Cancellation with refund details
const cancellationResult = await api.put(`/liteapi/bookings/${bookingId}`)

if (cancellationResult.canCancel) {
  console.log(`Refund: ₹${cancellationResult.refundAmount}`)
  console.log(`Fee: ₹${cancellationResult.cancellationFee}`)
} else if (cancellationResult.isNonRefundable) {
  console.log("Non-refundable booking cannot be cancelled")
}
```

## UI Components

### SearchBar with AI & Autocomplete
- Natural language AI search capability
- Debounced place autocomplete
- Advanced filtering options
- Strict facility filtering toggle

### BookingFlow Modal
- Multi-step booking process (Rates → Prebook → Payment → Confirmation)
- Real-time price change warnings
- Guest information collection
- Payment tokenization integration

### HotelCard Enhanced
- Facility icons and badges
- Star rating display
- Price formatting with currency
- Direct booking integration

### HotelDetails Comprehensive
- Image gallery display
- AI-generated hotel summaries
- Sentiment analysis from reviews
- Integrated booking flow
- Facility categorization with icons

## Performance Optimizations

### Frontend
- Debounced autocomplete (300ms delay)
- Image lazy loading and optimization
- Component-level loading states
- Error boundary implementation

### Backend
- Connection pooling for API calls
- Response caching for static data (currencies, facilities, etc.)
- Timeout configuration for reliable performance
- Structured error responses with detail levels

## Testing & Monitoring

### Health Checks
- `GET /api/liteapi/health` - Verify LiteAPI connectivity and authentication
- `GET /api/health` - Overall system health including LiteAPI status

### Logging
- Comprehensive error logging with request/response details
- Performance monitoring for API call durations
- User action tracking for booking funnel analysis

## Integration Checklist

- [ ] LiteAPI credentials configured in `.env`
- [ ] Authentication method selected (Standard vs Secure)
- [ ] Payment tokenization SDK integrated
- [ ] Error handling and user feedback implemented
- [ ] Performance monitoring and logging configured
- [ ] Security review completed
- [ ] End-to-end booking flow tested
- [ ] Mobile responsiveness verified
- [ ] Accessibility compliance checked

## Support & Documentation

For additional LiteAPI documentation and support:
- [Official LiteAPI v3 Documentation](https://docs.liteapi.travel)
- [LiteAPI Postman Collection](https://github.com/liteapi-travel/postman-collection)
- SmartTravel AI specific implementation in `server/controllers/liteapiController.js`
