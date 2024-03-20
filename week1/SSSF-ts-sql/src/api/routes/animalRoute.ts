// animalRoute.ts
import express from 'express';
import {animalListGet, animalGet} from '../controllers/animalController';

const router = express.Router();

router.route('/').get(animalListGet);

router.route('/:id').get(animalGet);

export default router;
