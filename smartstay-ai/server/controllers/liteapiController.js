import axios from 'axios';

function getLiteEnv() {
  return {
    baseURL: process.env.LITEAPI_BASE_URL,
    key: process.env.LITEAPI_KEY,
    timeout: Number(process.env.LITEAPI_TIMEOUT_MS || 20000),
    authHeaderName: process.env.LITEAPI_AUTH_HEADER_NAME || 'Authorization',
    authScheme: (process.env.LITEAPI_AUTH_SCHEME || 'bearer').toLowerCase(),
    searchPath: process.env.LITEAPI_SEARCH_PATH || '/hotels/search',
    detailsPath: process.env.LITEAPI_DETAILS_PATH || '/hotels/:id',
    bookPath: process.env.LITEAPI_BOOK_PATH || '/bookings',
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
      ...buildAuthHeader(env),
    },
  });
}

export async function searchHotels(req, res, next) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    // Endpoint path can differ; allow override via env
    const path = env.searchPath;
    const q = req.query || {};
    let params;
    if (path.includes('/data/hotels')) {
      // Official LiteAPI example: /data/hotels?countryCode=IT&cityName=Rome
      params = {
        countryCode: q.countryCode || q.country || q.cc,
        cityName: q.cityName || q.destination || q.city,
      };
    } else {
      // Sandbox host style params
      params = {
        placeId: q.placeId,
        name: q.destination || q.name,
        checkin: q.checkIn || q.checkin,
        checkout: q.checkOut || q.checkout,
        rooms: q.rooms || 1,
        adults: q.guests || q.adults || 2,
        children: q.children || '',
        occupancies: q.occupancies,
        sorting: q.sorting || 1,
        hotelName: q.hotelName || '',
        searchHotelName: q.searchHotelName || '',
        trackingId: q.trackingId || '',
        highlightHotelId: q.highlightHotelId || '',
        language: q.language || 'en',
        currency: q.currency || 'INR',
      };
    }
    const { data } = await client.get(path, { params });
    res.json(data);
  } catch (err) {
    console.error('LiteAPI search error:', {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    res.status(err.response?.status || 500).json({ error: 'LiteAPI search failed', detail: err.response?.data || err.message });
  }
}

export async function getHotelDetails(req, res, next) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    const { id } = req.params;
    const detailsPathTemplate = env.detailsPath;
    const path = detailsPathTemplate.replace(':id', encodeURIComponent(id));
    const { data } = await client.get(path);
    res.json(data);
  } catch (err) {
    console.error('LiteAPI details error:', { status: err.response?.status, data: err.response?.data, message: err.message });
    res.status(err.response?.status || 500).json({ error: 'LiteAPI details failed', detail: err.response?.data || err.message });
  }
}

export async function bookHotel(req, res, next) {
  try {
    const env = getLiteEnv();
    const client = buildClient();
    const path = env.bookPath;
    const { data } = await client.post(path, req.body);
    res.json(data);
  } catch (err) {
    console.error('LiteAPI booking error:', { status: err.response?.status, data: err.response?.data, message: err.message });
    res.status(err.response?.status || 500).json({ error: 'LiteAPI booking failed', detail: err.response?.data || err.message });
  }
}
