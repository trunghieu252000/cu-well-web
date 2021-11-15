import {inject, injectable} from 'tsyringe';

import {ServiceResponseStatus} from '../../services/types/serviceResponse';
import {
  CreateUserFailure,
  GetAllRoleNamesOfUserFailure,
  GetUserFailure,
  IUserService,
  UpdateUserFailure,
} from '../../services/userService';
import {IRequest, IResponse} from '../types';

import {NotFoundResult, OkResult, ConflictResult} from './../httpResponses';

@injectable()
export class UserController {
  constructor(@inject('IUserService') private userService: IUserService) {
    this.createUserWithRoleClient = this.createUserWithRoleClient.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateStatusOfUser = this.updateStatusOfUser.bind(this);
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

  public async createUserWithRoleClient(req: IRequest, res: IResponse) {
    const {newUserData} = req.body;

    const {result: newUser, status, failure} = await this.userService.createUserWithRoleClient(
      newUserData,
    );

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case CreateUserFailure.UserAlreadyExists:
          return res.send(
            ConflictResult({
              reason: failure.reason,
              message: `User with email ${newUserData.email} already exists`,
            }),
          );
      }
    }

    return res.send(OkResult(newUser));
  }

  public async updateUser(req: IRequest, res: IResponse) {
    const {userId} = req.params;
    const {userData} = req.body;

    const {result: updatedUser, status, failure} = await this.userService.updateUser(
      userId,
      userData,
    );

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case UpdateUserFailure.UserNotFound:
          return res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'User not found',
            }),
          );
      }
    }

    return res.send(OkResult(updatedUser));
  }

  public async updateStatusOfUser(req: IRequest, res: IResponse) {
    const {userStatusData} = req.body;

    const {result: updatedUser, status, failure} = await this.userService.updateStatusOfUser(
      userStatusData.userId,
      userStatusData.status,
    );

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case UpdateUserFailure.UserNotFound:
          return res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'User not found',
            }),
          );
      }
    }

    return res.send(OkResult(updatedUser));
  }
}
