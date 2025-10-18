import { Router } from 'express';
import { chatWithGemini, summarizeHotel, compareHotels, smartFilterQuery, travelPlan, geminiHealth } from '../controllers/geminiController.js';

const router = Router();

router.post('/chat', chatWithGemini);
router.post('/summarize-hotel', summarizeHotel);
router.post('/compare', compareHotels);
router.post('/smart-filter', smartFilterQuery);
router.post('/travel-plan', travelPlan);
router.get('/health', geminiHealth);

export default router;
