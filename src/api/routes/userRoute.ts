import {container} from 'tsyringe';
import express from 'express';

import {JoiSchema, JoiValidationSchema, joiValidator} from '../middlewares/joiMiddleware';

import {wrapper} from './../../utils/routeWrapper';
import {UserController} from './../controller/userController';

const router = express.Router();
const userController = container.resolve(UserController);

router.get('/user-roles/:userId', wrapper(userController.getAllRoleNameOfUser));

router.get('/:userId', wrapper(userController.getUserDetails));
router.get('/seller/:userId', wrapper(userController.getSeller));

router.put(
  '/status',
  joiValidator(JoiValidationSchema.userStatusData, JoiSchema.userStatusData),
  wrapper(userController.updateStatusOfUser),
);
router.get('/', wrapper(userController.getAllUsers));

router.put(
  '/:userId',
  joiValidator(JoiValidationSchema.userData, JoiSchema.userData),
  wrapper(userController.updateUser),
);

router.put(
  '/password',
  joiValidator(JoiValidationSchema.changePasswordData, JoiSchema.changePasswordData),
  wrapper(userController.changePassword),
);
export default router;
