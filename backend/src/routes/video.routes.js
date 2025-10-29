import express from 'express';
import { generateVideo, getVideoTaskStatus, listVideos, deleteVideo } from '../controllers/video.controller.js';

const router = express.Router();

router.post('/generate', generateVideo);
router.post('/status', getVideoTaskStatus);
router.get('/list', listVideos);
router.delete('/:id', deleteVideo);

export default router;
