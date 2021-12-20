import Joi from 'joi';

import {IRequest, IResponse} from '../types';
import {ValidationResult} from '../httpResponses';

export enum JoiSchema {
  changePasswordData = 'changePasswordData',
  role = 'role',
  loginData = 'loginData',
  newUserData = 'newUserData',
  userStatusData = 'userStatusData',
  userData = 'userData',
  ratingData = 'ratingData',
}

export function joiValidator(schema: any, param: string) {
  return async (req: IRequest, res: IResponse, next) => {
    try {
      const body = req.body;

      await schema.validateAsync(body[param]);
      next();
    } catch (err) {
      return res.send(
        ValidationResult(
          err.details.map((x) => ({
            reason: 'BadRequest',
            message: x.message,
          })),
        ),
      );
    }
  };
}

export const JoiValidationSchema = {
  loginData: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
    .required()
    .options({abortEarly: false}),

  changePasswordData: Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  })
    .required()
    .options({abortEarly: false}),

  role: Joi.object()
    .keys({
      name: Joi.string().required(),
    })
    .required()
    .options({abortEarly: false}),

  newUserData: Joi.object({
    email: Joi.string().email().trim().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    address: {
      city: Joi.string().required(),
      district: Joi.string().required(),
      commune: Joi.string().required(),
    },
  })
    .required()
    .options({abortEarly: false}),

  userStatusData: Joi.object({
    userId: Joi.string().required(),
    status: Joi.boolean().required(),
  })
    .required()
    .options({abortEarly: false}),

  userData: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    ratingAverage: Joi.number().required(),
    paypalEmail: Joi.string().required(),
    address: {
      city: Joi.string().required(),
      district: Joi.string().required(),
      commune: Joi.string().required(),
    },
  })
    .required()
    .options({abortEarly: false}),

  ratingData: Joi.object({
    userId: Joi.string().required(),
    ratingUserId: Joi.string().required(),
    rating: Joi.number().required(),
  })
    .required()
    .options({abortEarly: false}),
};
