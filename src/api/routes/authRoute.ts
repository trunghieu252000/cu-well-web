import {container} from 'tsyringe';
import express from 'express';

import {AuthController} from '../controller/authController';
import {JoiSchema, JoiValidationSchema, joiValidator} from '../middlewares/joiMiddleware';

import {wrapper} from './../../utils/routeWrapper';

const router = express.Router();
const authController = container.resolve(AuthController);

router.post(
  '/login',
  joiValidator(JoiValidationSchema.loginData, JoiSchema.loginData),
  authController.login,
);
router.post('/forgot-password', wrapper(authController.forgotPassword));

export default router;
