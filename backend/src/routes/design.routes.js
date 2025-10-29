import express from 'express';
import { generateDesign, getPhotoshoots, removePhotoshoot } from '../controllers/design.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Generate photoshoot
router.post('/generate', upload.fields([
  { name: 'garment', maxCount: 1 }
]), generateDesign);

// Get all photoshoots
router.get('/photoshoots', getPhotoshoots);

// Delete a photoshoot
router.delete('/photoshoots/:id', removePhotoshoot);

export default router;
