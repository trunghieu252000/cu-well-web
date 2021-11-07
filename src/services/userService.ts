import {inject, injectable} from 'tsyringe';

import {User} from '../data/schemas';

import {IUserRepository} from './../data/repositories/userRepository';
import {ServiceFailure, ServiceResponse, ServiceResponseStatus} from './types/serviceResponse';

export enum GetUserFailure {
  'UserNotFound' = 'UserNotFound',
}
export enum GetAllRoleNamesOfUserFailure {
  'RoleNotFound' = 'RoleNotFound',
}

export interface IUserService {
  getUserDetails(userId: string): Promise<ServiceResponse<User, ServiceFailure<GetUserFailure>>>;
  getAllRoleNamesOfUser(
    userId: string,
  ): Promise<ServiceResponse<string[], ServiceFailure<GetAllRoleNamesOfUserFailure>>>;
}

@injectable()
export class UserService implements IUserService {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  public async getUserDetails(
    userId: string,
  ): Promise<ServiceResponse<User, ServiceFailure<GetUserFailure>>> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: GetUserFailure.UserNotFound},
      };
    }

    return {
      status: ServiceResponseStatus.Success,
      result: user,
    };
  }

  public async getAllRoleNamesOfUser(
    userId: string,
  ): Promise<ServiceResponse<string[], ServiceFailure<GetAllRoleNamesOfUserFailure>>> {
    const roles = await this.userRepository.getRoleNameByUserId(userId);

    if (roles.length === 0) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: GetAllRoleNamesOfUserFailure.RoleNotFound},
      };
    }

    return {
      status: ServiceResponseStatus.Success,
      result: roles,
    };
  }
}
