import {Request, Response, NextFunction} from 'express';
import {getAllCategories, getCategoryById, putCategory, postCategory, deleteCategory} from '../models/categoryModel';
import {Category} from '../../types/DBTypes';
import { validationResult } from 'express-validator';
import CustomError from '../../classes/CustomError';
import { validateRequest } from '../../middlewares';

const categoryListGet = async (
  req: Request,
  res: Response<Category[]>,
  next: NextFunction
) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const categoryGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<Category>,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const category = await getCategoryById(id);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const categoryPost = async (
  req: Request<{}, {}, Category>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = req.body;
    const result = await postCategory(category);
    if (!result) {
      res.status(400).end();
      return;
    }
    res.status(201).end();
  } catch (error) {
    next(error);
  }
}

const categoryPut = async (
  req: Request<{id: string}, {}, Category>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const category = req.body;
    const result = await putCategory(id, category);
    if (!result) {
      res.status(400).end();
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

const categoryDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteCategory(id);
    if (!result) {
      res.status(400).end();
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

export {categoryListGet, categoryGet, categoryPost, categoryPut, categoryDelete};
