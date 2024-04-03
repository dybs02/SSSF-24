import { NextFunction, Request, Response } from 'express';
import CustomError from '../../classes/CustomError';
import { Cat, CatTest } from '../../types/DBTypes';
import { MessageResponse } from '../../types/MessageTypes';
import catModel from '../models/catModel';


type boundingBox = {
  topRight: String,
  bottomLeft: String,
}


const catListGet = async (
  req: Request<{}, {}, {}>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await catModel.find().select('-__v').populate('owner', '-__v');
    res.json(cats);
  } catch (error) {
    next(error);
  }
}


const catGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<Cat>,
  next: NextFunction
) => {
  try {
    const cat = await catModel.findById(req.params.id).select('-__v').populate('owner', '-__v');
    if (!cat) {
      throw new CustomError('No cat found', 404);
    }
    res.json(cat);
  } catch (error) {
    next(error);
  }
}


const catGetByUser = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await catModel.find({owner: res.locals.user}).select('-__v').populate('owner', '-__v');
    res.json(cats);
  } catch (error) {
    next(error);
  }  
}

// TODO fix
const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, boundingBox>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const coords = [
      req.query.topRight.split(',').map(parseFloat),
      req.query.bottomLeft.split(',').map(parseFloat),
    ]

    const cats = await catModel.find({
      location: {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [[
              coords[0],
              [coords[0][0], coords[1][1]],
              coords[1],
              [coords[1][0], coords[0][1]],
              coords[0],
            ]]
          }
        }
      }
    });
    res.json(cats);
  } catch (error) {
    next(error);
  }
}


const catPost = async (
  req: Request<{}, {}, Cat>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const cat = req.body as Cat;
    cat.owner = res.locals.user._id;
    cat.location = res.locals.coords;
    const createdCat = await catModel.create(cat);
    res.json({
      message: 'Cat added',
      data: createdCat,
    });
  } catch (error) {
    next(error);  
  }
}


const catPutAdmin = async (
  req: Request<{id: string}, {}, CatTest>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const currnetUser = res.locals.user;
    if (currnetUser.role !== 'admin') {
      throw new CustomError('Not authorized', 401);
    }

    const updatedCat = await catModel.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!updatedCat) {
      throw new CustomError('No cat found', 404);
    }
    res.json({message: 'Cat updated', data: updatedCat});
  } catch (error) {
    next(error);
  }
}


const catPut = async (
  req: Request<{id: string}, {}, CatTest>, // TODO cat partial or just Cat
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const params = {
      _id: req.params.id,
      owner: res.locals.user._id,
    };

    const updatedCat = await catModel.findByIdAndUpdate(params, req.body, {new: true});
    if (!updatedCat) {
      throw new CustomError('No cat found', 404);
    }
    res.json({message: 'Cat updated', data: updatedCat});
  } catch (error) {
    next(error);
  }
}


const catDeleteAdmin = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const currnetUser = res.locals.user;
    if (currnetUser.role !== 'admin') {
      throw new CustomError('Not authorized', 401);
    }

    const deletedCat = await catModel.findByIdAndDelete(req.params.id);
    if (!deletedCat) {
      throw new CustomError('No cat found', 404);
    }
    res.json({message: 'Cat deleted', data: deletedCat});
  } catch (error) {
    next(error);
  }
}


const catDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  try {
    const params = {
      _id: req.params.id,
      owner: res.locals.user._id,
    };

    const deletedCat = await catModel.findByIdAndDelete(params);
    if (!deletedCat) {
      throw new CustomError('No cat found', 404);
    }
    res.json({message: 'Cat deleted', data: deletedCat});
  } catch (error) {
    next(error);
  }
}


export { catDelete, catDeleteAdmin, catGet, catGetByBoundingBox, catGetByUser, catListGet, catPost, catPut, catPutAdmin };
