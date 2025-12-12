import express from 'express';
import { searchCabs, getCabById } from '../controllers/cab.controller.js';

const router = express.Router();

router.get('/search', searchCabs);
router.get('/:id', getCabById);

export default router;
