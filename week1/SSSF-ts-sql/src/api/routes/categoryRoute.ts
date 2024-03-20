import express from 'express';
import {categoryGet, categoryListGet} from '../controllers/categoryController';

const router = express.Router();

router.route('/').get(categoryListGet);

router.route('/:id').get(categoryGet);

export default router;
