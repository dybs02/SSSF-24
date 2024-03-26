import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import {MessageResponse} from '../../types/MessageTypes';
import {Cat, User} from '../../types/DBTypes';

const catListGet = async (
  _req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (req: Request, res: Response<Cat>, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_get validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = Number(req.params.id);
    const cat = await getCat(id);
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, Omit<Cat, 'owner'> & {owner: number}>,
  // res: Response<MessageResponse, {coords: [number, number]}>, // TODO test expects id 
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    if (!req.file) throw new CustomError('No file uploaded', 400);
    if (!req.user) throw new CustomError('No user logged in', 401);

    const cat = req.body;
    const usr = req.user as User;
    cat.filename = req.file.filename;
    cat.lat = res.locals.coords[0];
    cat.lng = res.locals.coords[1];
    cat.owner = usr.user_id || 0;
    const id = await addCat(cat);
    res.json({id: id});

  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_put validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = Number(req.params.id);
    const cat = req.body;
    const usr = req.user as User;
    const result = await updateCat(cat, id, usr.user_id, usr.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const catDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_delete validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = Number(req.params.id);
    const result = await deleteCat(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export {catListGet, catGet, catPost, catPut, catDelete};
