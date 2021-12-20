import {container} from 'tsyringe';
import express from 'express';

import {JoiSchema, JoiValidationSchema, joiValidator} from '../middlewares/joiMiddleware';

import {wrapper} from './../../utils/routeWrapper';
import {UserController} from './../controller/userController';

const router = express.Router();
const userController = container.resolve(UserController);

router.get('/statistic/sell-users', wrapper(userController.statisticUserByPost));
router.get('/statistic/users-created', wrapper(userController.statisticUserCreated));
router.put(
  '/user/status',
  joiValidator(JoiValidationSchema.userStatusData, JoiSchema.userStatusData),
  wrapper(userController.updateStatusOfUser),
);
router.get('/users', wrapper(userController.getAllUsers));

export default router;
