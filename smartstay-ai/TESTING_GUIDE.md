# Quick Test Guide - LiteAPI Endpoints

This guide helps you quickly test all the new LiteAPI endpoints.

## Prerequisites

1. Make sure your backend is running:
   ```bash
   cd server
   node index.js
   ```

2. Your `.env` should have:
   ```
   LITEAPI_KEY=sand_8e85fa99-d484-4a00-bd9d-99cb3b93d0d2
   LITEAPI_BASE_URL=https://api.liteapi.travel/v3.0
   ```

## Test Endpoints (Copy & Paste)

### 1. Health Check
```bash
curl http://localhost:5000/api/liteapi/health
```

### 2. Search Hotels (Rome, Italy)
```bash
curl "http://localhost:5000/api/liteapi/search?countryCode=IT&cityName=Rome"
```

### 3. Get Hotel Details
```bash
# Replace lp3803c with an actual hotel ID from search results
curl "http://localhost:5000/api/liteapi/hotels/lp3803c"
```

### 4. Get Rates (Multi-hotel, Multi-room)
```bash
curl -X POST http://localhost:5000/api/liteapi/rates ^
  -H "Content-Type: application/json" ^
  -d "{\"hotelIds\":[\"lp3803c\"],\"occupancies\":[{\"adults\":2,\"children\":[]}],\"currency\":\"USD\",\"guestNationality\":\"US\",\"checkin\":\"2024-12-30\",\"checkout\":\"2024-12-31\"}"
```

**PowerShell version:**
```powershell
$body = @{
    hotelIds = @("lp3803c")
    occupancies = @(@{adults=2; children=@()})
    currency = "USD"
    guestNationality = "US"
    checkin = "2024-12-30"
    checkout = "2024-12-31"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/liteapi/rates" -Method Post -Body $body -ContentType "application/json"
```

### 5. Prebook (Create Checkout Session)
```bash
# Replace OFFER_ID with an actual offerId from rates response
curl -X POST "http://localhost:5000/api/liteapi/prebook?timeout=30" ^
  -H "Content-Type: application/json" ^
  -d "{\"offerId\":\"YOUR_OFFER_ID_HERE\",\"usePaymentSdk\":true}"
```

### 6. Complete Booking
```bash
# Replace PREBOOK_ID with prebookId from prebook response
curl -X POST http://localhost:5000/api/liteapi/book ^
  -H "Content-Type: application/json" ^
  -d "{\"prebookId\":\"YOUR_PREBOOK_ID\",\"holder\":{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\"},\"guests\":[{\"occupancyNumber\":1,\"remarks\":\"Quiet room\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\"}],\"payment\":{\"method\":\"NONE\"}}"
```

### 7. List Bookings
```bash
curl "http://localhost:5000/api/liteapi/bookings?clientReference=john@example.com"
```

### 8. Get Booking Details
```bash
# Replace BOOKING_ID with actual booking ID
curl "http://localhost:5000/api/liteapi/bookings/YOUR_BOOKING_ID"
```

### 9. Cancel Booking
```bash
# Replace BOOKING_ID with actual booking ID
curl -X PUT "http://localhost:5000/api/liteapi/bookings/YOUR_BOOKING_ID"
```

### 10. Get IATA Codes
```bash
curl "http://localhost:5000/api/liteapi/iata-codes"
```

## Frontend Testing

Open your browser console at `http://localhost:5173` and try:

### Import API methods
```javascript
// In browser console (if api.js exports are available globally)
// Or create a test page component

// Search hotels
const search = await fetch('/api/liteapi/search?countryCode=IT&cityName=Rome').then(r => r.json());
console.log('Hotels:', search);

// Get rates
const ratesReq = await fetch('/api/liteapi/rates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hotelIds: ['lp3803c'],
    occupancies: [{ adults: 2, children: [] }],
    currency: 'USD',
    guestNationality: 'US',
    checkin: '2024-12-30',
    checkout: '2024-12-31'
  })
});
const rates = await ratesReq.json();
console.log('Rates:', rates);
```

### Using the API Client

Create a test component:

```javascript
// client/src/pages/Test.jsx
import { useEffect, useState } from 'react';
import { getRates, prebook, book, listBookings } from '../lib/api';

export default function Test() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function test() {
      try {
        // Test 1: Get rates
        const rates = await getRates(
          ['lp3803c'],
          [{ adults: 2, children: [] }],
          '2024-12-30',
          '2024-12-31'
        );
        console.log('Rates:', rates);
        setData(rates);

        // Test 2: List bookings
        const bookings = await listBookings('test@example.com');
        console.log('Bookings:', bookings);

      } catch (err) {
        console.error('Test error:', err);
      }
    }
    test();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
```

Then add to your routes:
```javascript
// In App.jsx
import Test from './pages/Test';

<Routes>
  {/* ...existing routes */}
  <Route path="/test" element={<Test />} />
</Routes>
```

Navigate to `http://localhost:5173/test` to see the results.

## Expected Responses

### Search Response
```json
{
  "data": [
    {
      "id": "lp3803c",
      "name": "Hotel Example",
      "location": "Rome, Italy",
      ...
    }
  ]
}
```

### Rates Response
```json
{
  "data": [
    {
      "hotelId": "lp3803c",
      "offers": [
        {
          "offerId": "GE5ESNBSIZKVEQ2OJRFEURSP...",
          "price": 115.50,
          "currency": "USD",
          "roomType": { "name": "Standard Room" },
          ...
        }
      ]
    }
  ]
}
```

### Booking Response
```json
{
  "data": {
    "bookingId": "hSq2gVDrf",
    "status": "CONFIRMED",
    "hotelConfirmationCode": "ABC123",
    ...
  }
}
```

## Common Issues

### 1. "Invalid API Key"
- Check `LITEAPI_KEY` in `.env`
- Verify it starts with `sand_` for sandbox
- Ensure no extra spaces

### 2. "Base URL not found"
- Check `LITEAPI_BASE_URL=https://api.liteapi.travel/v3.0`
- No trailing slash

### 3. "No availability found"
- Try different dates (future dates)
- Try different cities
- Check if hotel ID exists

### 4. CORS errors
- Make sure backend is running on port 5000
- Check `CLIENT_ORIGIN=http://localhost:5173` in `.env`

## Next Steps

Once all endpoints work:
1. Build booking UI components
2. Add error handling in frontend
3. Create booking flow wizard
4. Add booking management page
5. Integrate IATA codes for autocomplete

Happy testing! 🎉
