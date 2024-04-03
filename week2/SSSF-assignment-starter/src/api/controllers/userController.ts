import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import CustomError from '../../classes/CustomError';
import { User, UserInput, UserOutput } from '../../types/DBTypes';
import { MessageResponse } from '../../types/MessageTypes';
import userModel from '../models/userModel';


const userListGet = async (
  req: Request<{}, {}, {}>,
  res: Response<UserOutput[]>,
  next: NextFunction
) => {
  try {
    const users = await userModel.find().select('-password -__v -role');
    res.json(users);
  } catch (error) {
    next(error);
  }
}


const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const user = await userModel.findById(req.params.id).select('-password -__v -role');
    if (!user) {
      throw new CustomError('No user found', 404);
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}


const userPost = async (
  req: Request<{}, {}, UserInput>,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  try {
    let user = req.body as Omit<User, '_id'>;
    user.role = 'user';
    user.password = bcrypt.hashSync(req.body.password, 10);
    const createdUser = await userModel.create(req.body);
    const { password, role, ...userOutput } = createdUser.toObject();
    res.json({message: 'Created user', data: userOutput});
  } catch (error) {
    next(error);   
  }
}


const userPutCurrent = async (
  req: Request<{}, {}, Partial<User>>,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  try {
    const inputUser = req.body as Partial<User>;
    const updatedUser = await userModel.findByIdAndUpdate(res.locals.user._id, inputUser, {new: true}).select('-password -__v -role');
    if (!updatedUser) {
      throw new CustomError('No user found', 404);
    }
    res.json({message: 'User updated', data: updatedUser});
  } catch (error) {
    next(error);
  }
}


const userDeleteCurrent = async (
  req: Request<{}, {}, {}>,
  res: Response<MessageResponse & {data: UserOutput}>,
  next: NextFunction
) => {
  try {
    const currnetUser = res.locals.user;
    const deletedUser = await userModel.findByIdAndDelete(currnetUser._id).select('-password -__v -role');
    if (!deletedUser) {
      throw new CustomError('No user found', 404);
    }
    res.json({message: 'User deleted', data: deletedUser});
  } catch (error) {
    next(error);
  }
}


const checkToken = async (
  req: Request<{}, {}, {}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    let user = res.locals.user;
    delete user.password;
    delete user.role;
    res.json(user);
  } catch (error) {
    next(error);
  }
}


export { checkToken, userDeleteCurrent, userGet, userListGet, userPost, userPutCurrent };
