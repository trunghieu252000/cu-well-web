import {container} from 'tsyringe';
import express from 'express';

import {AuthController} from '../controller/authController';
import {JoiSchema, JoiValidationSchema, joiValidator} from '../middlewares/joiMiddleware';
import {UserController} from '../controller/userController';

import {wrapper} from './../../utils/routeWrapper';

const router = express.Router();
const authController = container.resolve(AuthController);
const userController = container.resolve(UserController);

router.post(
  '/',
  joiValidator(JoiValidationSchema.newUserData, JoiSchema.newUserData),
  wrapper(userController.createUserWithRoleClient),
);
router.post(
  '/login',
  joiValidator(JoiValidationSchema.loginData, JoiSchema.loginData),
  authController.login,
);
router.patch('/forgot-password', wrapper(authController.forgotPassword));

export default router;
