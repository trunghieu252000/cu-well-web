import {container} from 'tsyringe';
import express from 'express';

import {wrapper} from './../../utils/routeWrapper';
import {UserController} from './../controller/userController';

const router = express.Router();
const userController = container.resolve(UserController);

router.get('/user-roles', wrapper(userController.getAllRoleNameOfUser));
router.get('/userId', wrapper(userController.getUserDetails));
export default router;
