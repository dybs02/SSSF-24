import express from 'express';
import {
  checkToken,
  userDelete,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPut,
  userPutCurrent,
} from '../controllers/userController';
import passport from '../../passport';
import {body, param} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(
    body('user_name').notEmpty().isString().isLength({min: 3, max: 30}),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isString().isLength({min: 5, max: 30}),
    userPost
  )
  .put(passport.authenticate('jwt', {session: false}), userPutCurrent)
  .delete(passport.authenticate('jwt', {session: false}), userDeleteCurrent);

router.get(
  '/token',
  passport.authenticate('jwt', {session: false}),
  checkToken
);

router
  .route('/:id')
  .get(userGet)
  .put(passport.authenticate('jwt', {session: false}), userPut)
  .delete(passport.authenticate('jwt', {session: false}), userDelete);

export default router;
