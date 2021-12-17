import {container} from 'tsyringe';

import {UserService} from '../../services/userService';
import {IRequest, IResponse} from '../types';
// import {ServiceResponseStatus} from '../../services/types/serviceResponse';

import {NotFoundResult} from './../httpResponses';
import {AuthenticationFailure} from './../../services/authService';
export default async (req: IRequest, res: IResponse, next) => {
  const userService = container.resolve(UserService);
  const decodedUser = req.token.user;
  const user = (await userService.getUserDetails(decodedUser.id.toString())).result;
  let token;

  if (!user) {
    return res.send(
      NotFoundResult({
        reason: AuthenticationFailure.UserNotFound,
        message: 'User not found',
      }),
    );
  }

  // const {
  //   result: role,
  //   failure,
  //   status: getRolesOfUserStatus,
  // } = await userService.getAllRoleNamesOfUser(decodedUser.id.toString());

  // if (getRolesOfUserStatus === ServiceResponseStatus.Failed) {
  //   switch (failure.reason) {
  //     case GetAllRoleNamesOfUserFailure.RoleNotFound:
  //       return res.send(
  //         NotFoundResult({
  //           reason: failure.reason,
  //           message: 'Role not found',
  //         }),
  //       );
  //   }
  // }
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0].toLowerCase() === 'bearer'
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  req.user = user;
  // req.role = role;
  req.token = token;

  return next();
};
