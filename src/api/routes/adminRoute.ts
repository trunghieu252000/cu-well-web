import {container} from 'tsyringe';
import express from 'express';

import {JoiSchema, JoiValidationSchema, joiValidator} from '../middlewares/joiMiddleware';

import {wrapper} from './../../utils/routeWrapper';
import {UserController} from './../controller/userController';

const router = express.Router();
const userController = container.resolve(UserController);

router.get('/users', wrapper(userController.getAllUsers));
router.get('/statistic/sell-users', wrapper(userController.statisticUserByPost));
router.get('/statistic/buyer', wrapper(userController.statisticBuyer));
router.get('/statistic/users-created', wrapper(userController.statisticUserCreated));
router.put('/status/:userId', wrapper(userController.blockUser));

router.post(
  '/',
  joiValidator(JoiValidationSchema.newUserData, JoiSchema.newUserData),
  wrapper(userController.createUserWithRoleAdmin),
);
export default router;
