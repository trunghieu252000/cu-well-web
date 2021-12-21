import {inject, injectable} from 'tsyringe';
import mongoose from 'mongoose';
import axios, {AxiosResponse} from 'axios';

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
  ForbiddenResult,
} from './../httpResponses';

@injectable()
export class UserController {
  constructor(@inject('IUserService') private userService: IUserService) {
    this.createUserWithRoleClient = this.createUserWithRoleClient.bind(this);
    this.createUserWithRoleAdmin = this.createUserWithRoleAdmin.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateStatusOfUser = this.updateStatusOfUser.bind(this);
    this.blockUser = this.blockUser.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
    this.getAllRoleNameOfUser = this.getAllRoleNameOfUser.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getSeller = this.getSeller.bind(this);
    this.statisticUserByPost = this.statisticUserByPost.bind(this);
    this.statisticUserCreated = this.statisticUserCreated.bind(this);
  }

  public async statisticUserCreated(req: IRequest, res: IResponse) {
    const role = [...req.user.role];

    console.log('role: ', role);

    if (role.includes('Admin')) {
      const users = await this.userService.statisticUserCreated();

      return res.send(OkResult(users.result));
    } else {
      return res.send(
        ForbiddenResult({
          reason: 'Forbidden',
          message: 'Only Admin can access this api ',
        }),
      );
    }
  }

  public async statisticUserByPost(req: IRequest, res: IResponse) {
    const config = {
      headers: {
        Authorization: `Bearer ${req.token}`,
      },
    };
    const role = [...req.user.role];

    if (role.includes('Admin')) {
      try {
        const response: AxiosResponse<any> = await axios.get(
          'https://cuwell-post-service.herokuapp.com/api/v1/statistics/users/number-of-posts/',
          config,
        );
        const {result: user, status, failure} = await this.userService.statisticUserByPost(
          response.data,
        );

        if (status === ServiceResponseStatus.Failed) {
          switch (failure.reason) {
            case GetUserFailure.UserNotFound:
              return res.send(
                NotFoundResult({
                  reason: failure.reason,
                  message: 'Bad request',
                }),
              );
          }
        }

        return res.send(OkResult(user));
      } catch (err) {
        return res.send(
          BadRequestResult({
            message: 'ERROR',
          }),
        );
      }
    } else {
      return res.send(
        ForbiddenResult({
          reason: 'Forbidden',
          message: 'Only Admin can access this api ',
        }),
      );
    }
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
              message: 'User not found',
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

  public async createUserWithRoleAdmin(req: IRequest, res: IResponse) {
    const {newUserData} = req.body;
    const role = [...req.user.role];

    if (!role.includes('Admin')) {
      return res.send(
        ForbiddenResult({
          reason: 'Forbidden',
          message: 'Only Admin can access this api ',
        }),
      );
    }
    const {result: newUser, status, failure} = await this.userService.createUserWithRoleAdmin(
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

  public async blockUser(req: IRequest, res: IResponse) {
    const {userId} = req.params;
    const role = [...req.user.role];

    if (!role.includes('Admin')) {
      return res.send(
        ForbiddenResult({
          reason: 'Forbidden',
          message: 'Only Admin can access this api ',
        }),
      );
    }

    const {status, failure} = await this.userService.updateStatusOfUser(userId, false);

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

    const {oldPassword, newPassword} = req.body.changePasswordData;

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
