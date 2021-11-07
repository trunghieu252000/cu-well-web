import {container} from 'tsyringe';

import {GetAllRoleNamesOfUserFailure, UserService} from '../../services/userService';
import {IRequest, IResponse} from '../types';
import {ServiceResponseStatus} from '../../services/types/serviceResponse';

import {NotFoundResult} from './../httpResponses';
import {AuthenticationFailure} from './../../services/authService';
export default async (req: IRequest, res: IResponse, next) => {
  const userService = container.resolve(UserService);
  const decodedUser = req.token.user;

  const user = (await userService.getUserDetails(decodedUser.id.toString())).result;

  if (!user) {
    return res.send(
      NotFoundResult({
        reason: AuthenticationFailure.UserNotFound,
        message: 'User not found',
      }),
    );
  }

  const {
    result: role,
    failure,
    status: getRolesOfUserStatus,
  } = await userService.getAllRoleNamesOfUser(decodedUser.id.toString());

  if (getRolesOfUserStatus === ServiceResponseStatus.Failed) {
    switch (failure.reason) {
      case GetAllRoleNamesOfUserFailure.RoleNotFound:
        return res.send(
          NotFoundResult({
            reason: failure.reason,
            message: 'Role not found',
          }),
        );
    }
  }

  req.user = user;
  req.role = role;

  return next();
};
