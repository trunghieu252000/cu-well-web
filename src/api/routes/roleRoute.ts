import {container} from 'tsyringe';
import express from 'express';

import {RoleController} from '../controller/roleController';
import {JoiSchema, JoiValidationSchema, joiValidator} from '../middlewares/joiMiddleware';

import {wrapper} from './../../utils/routeWrapper';

const router = express.Router();
const roleController = container.resolve(RoleController);

router.post(
  '/',
  joiValidator(JoiValidationSchema.role, JoiSchema.role),
  wrapper(roleController.createRole),
);
router.get('/', wrapper(roleController.getAllRoles));
router.get('/:userId', wrapper(roleController.getRoleDetails));

export default router;
