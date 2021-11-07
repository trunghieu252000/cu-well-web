import Joi from 'joi';

import {IRequest, IResponse} from '../types';
import {ValidationResult} from '../httpResponses';

export enum JoiSchema {
  changePasswordData = 'changePasswordData',
  role = 'role',
  loginData = 'loginData',
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
};
