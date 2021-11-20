import {container} from 'tsyringe';
import express from 'express';

import {RatingController} from '../controller/ratingController';
import {JoiSchema, JoiValidationSchema, joiValidator} from '../middlewares/joiMiddleware';

import {wrapper} from './../../utils/routeWrapper';

const router = express.Router();
const ratingController = container.resolve(RatingController);

router.get('/:userId', wrapper(ratingController.getRatingOfUser));
router.patch(
  '/',
  joiValidator(JoiValidationSchema.ratingData, JoiSchema.ratingData),
  wrapper(ratingController.updateRatingForUser),
);
export default router;
