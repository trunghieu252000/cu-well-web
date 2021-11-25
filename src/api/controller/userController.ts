import {inject, injectable} from 'tsyringe';
import mongoose from 'mongoose';

import {ServiceResponseStatus} from '../../services/types/serviceResponse';
import {
  ChangePasswordFailure,
  CreateUserFailure,
  GetAllRoleNamesOfUserFailure,
  GetUserFailure,
  IUserService,
  UpdateUserFailure,
} from '../../services/userService';
import {IRequest, IResponse} from '../types';

import {
  NotFoundResult,
  OkResult,
  ConflictResult,
  BadRequestResult,
  NoContentResult,
} from './../httpResponses';

@injectable()
export class UserController {
  constructor(@inject('IUserService') private userService: IUserService) {
    this.createUserWithRoleClient = this.createUserWithRoleClient.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateStatusOfUser = this.updateStatusOfUser.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
    this.getAllRoleNameOfUser = this.getAllRoleNameOfUser.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getSeller = this.getSeller.bind(this);
  }

  public async getUserDetails(req: IRequest, res: IResponse) {
    const userId =
      req.params.userId.match(/^[0-9a-fA-F]{24}$/) && mongoose.Types.ObjectId(req.params.userId);

    if (!userId) {
      return res.send(
        NotFoundResult({
          reason: GetUserFailure.UserNotFound,
          message: 'User not found',
        }),
      );
    }

    const {result: user, status, failure} = await this.userService.getUserDetails(
      userId.toHexString(),
    );

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

  public async getSeller(req: IRequest, res: IResponse) {
    const userId =
      req.params.userId.match(/^[0-9a-fA-F]{24}$/) && mongoose.Types.ObjectId(req.params.userId);

    if (!userId) {
      return res.send(
        NotFoundResult({
          reason: GetUserFailure.UserNotFound,
          message: 'User not found',
        }),
      );
    }

    const {result: user, status, failure} = await this.userService.getSeller(userId.toHexString());

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
    const {userData} = req.body;

    const userId =
      req.params.userId.match(/^[0-9a-fA-F]{24}$/) && mongoose.Types.ObjectId(req.params.userId);

    if (!userId) {
      return res.send(
        NotFoundResult({
          reason: GetUserFailure.UserNotFound,
          message: 'User not found',
        }),
      );
    }
    const {result: updatedUser, status, failure} = await this.userService.updateUser(
      userId.toHexString(),
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

    const {status, failure} = await this.userService.updateStatusOfUser(
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

    return res.send(NoContentResult());
  }

  public async changePassword(req: IRequest, res: IResponse) {
    const {email} = req.user;

    console.log('email: ', email);
    const {oldPassword, newPassword} = req.body.changePasswordData;

    console.log('oldPassword: ', oldPassword);

    const {status, failure} = await this.userService.changePassword(
      email,
      newPassword,
      oldPassword,
    );

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case ChangePasswordFailure.IncorrectPassword:
          return res.send(
            BadRequestResult({
              reason: failure.reason,
              message: 'Password is incorrect',
            }),
          );
      }
    }

    return res.send(NoContentResult());
  }

  public async getAllUsers(req: IRequest, res: IResponse) {
    const users = await this.userService.getAllUsers();

    return res.send(OkResult(users.result));
  }
}
