
import express from 'express';
import * as buddyController from '../controllers/buddy.controller.js';

const router = express.Router();

router.get('/history', buddyController.getHistory);
router.post('/chat', buddyController.chat);

export default router;
