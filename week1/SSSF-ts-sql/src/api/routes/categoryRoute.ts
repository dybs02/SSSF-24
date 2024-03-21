import express from 'express';
import {categoryDelete, categoryGet, categoryListGet, categoryPost, categoryPut} from '../controllers/categoryController';
import { body, param } from 'express-validator';
import { validateRequest } from '../../middlewares';

const router = express.Router();

router.route('/')
  .get(categoryListGet)
  .post(
    body('category_name').notEmpty().isString().isAlpha().escape(),
    validateRequest,
    categoryPost
  );

router.route('/:id')
  .get(
    param('id').isInt({min: 1}),
    categoryGet
  )
  .patch(
    param('id').isInt({min: 1}),
    body('category_name').notEmpty().isString().isAlpha().escape(),
    validateRequest,
    categoryPut
  )
  .delete(
    param('id').isInt({min: 1}),
    categoryDelete
  );

export default router;
