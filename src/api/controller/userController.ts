import {inject, injectable} from 'tsyringe';

import {ServiceResponseStatus} from '../../services/types/serviceResponse';
import {
  GetAllRoleNamesOfUserFailure,
  GetUserFailure,
  IUserService,
} from '../../services/userService';
import {IRequest, IResponse} from '../types';

import {NotFoundResult, OkResult} from './../httpResponses';

@injectable()
export class UserController {
  constructor(@inject('IUserService') private userService: IUserService) {
    this.getUserDetails = this.getUserDetails.bind(this);
    this.getAllRoleNameOfUser = this.getAllRoleNameOfUser.bind(this);
  }

  public async getUserDetails(req: IRequest, res: IResponse) {
    const {userId} = req.params;

    const {result: user, status, failure} = await this.userService.getUserDetails(userId);

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case GetUserFailure.UserNotFound:
          return res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'User not founds',
            }),
          );
      }
    }

    return res.send(OkResult(user));
  }

  public async getAllRoleNameOfUser(req: IRequest, res: IResponse) {
    const {userId} = req.params;

    const {result: roleNamesOfUser, status, failure} = await this.userService.getAllRoleNamesOfUser(
      userId,
    );

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case GetAllRoleNamesOfUserFailure.RoleNotFound:
          return res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'Role of user not found',
            }),
          );
      }
    }

    return res.send(OkResult(roleNamesOfUser));
  }
}
