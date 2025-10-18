import { Router } from 'express';
import { searchHotels, getHotelDetails, bookHotel } from '../controllers/liteapiController.js';
import axios from 'axios';
import express from 'express';

const router = Router();

router.get('/search', searchHotels);
router.get('/hotels/:id', getHotelDetails);
router.post('/book', bookHotel);

// Health check to verify LiteAPI base URL and auth
router.get('/health', async (req, res) => {
	try {
		const base = process.env.LITEAPI_BASE_URL;
		const key = process.env.LITEAPI_KEY;
		const AUTH_HEADER_NAME = process.env.LITEAPI_AUTH_HEADER_NAME || 'Authorization';
		const AUTH_SCHEME = (process.env.LITEAPI_AUTH_SCHEME || 'bearer').toLowerCase();
		const headers = { 'Content-Type': 'application/json' };
		if (AUTH_SCHEME === 'bearer') headers[AUTH_HEADER_NAME] = `Bearer ${key}`;
		else if (AUTH_SCHEME === 'apikey') headers[AUTH_HEADER_NAME] = key;
		await axios.get(base, { headers, timeout: 5000 });
		res.json({ ok: true, baseSet: !!base, keySet: !!key });
	} catch (e) {
		res.status(500).json({ ok: false, error: e.message, status: e.response?.status, data: e.response?.data });
	}
});

export default router;
