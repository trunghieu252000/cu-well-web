import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import {inject, injectable} from 'tsyringe';

import {IRoleRepository} from '../data/repositories/roleRepository';
import {User} from '../data/schemas';
import {IUserMailerSender} from '../infrastructure/mailer';
import {hashPassword} from '../utils/password';
import config from '../config';

import {IRatingRepository} from './../data/repositories/ratingRepository';
import {IUserRepository} from './../data/repositories/userRepository';
import {ServiceFailure, ServiceResponse, ServiceResponseStatus} from './types/serviceResponse';
export enum GetUserFailure {
  'UserNotFound' = 'UserNotFound',
}
export enum CreateUserFailure {
  'UserAlreadyExists' = 'UserAlreadyExists',
}
export enum UpdateUserFailure {
  'UserNotFound' = 'UserNotFound',
}
export enum GetAllRoleNamesOfUserFailure {
  'RoleNotFound' = 'RoleNotFound',
}
export enum ChangePasswordFailure {
  IncorrectPassword = 'IncorrectPassword',
}

export interface IUserService {
  createUserWithRoleClient(
    userData: User,
  ): Promise<ServiceResponse<User, ServiceFailure<CreateUserFailure>>>;
  getUserDetails(userId: string): Promise<ServiceResponse<User, ServiceFailure<GetUserFailure>>>;
  getAllRoleNamesOfUser(
    userId: string,
  ): Promise<ServiceResponse<string[], ServiceFailure<GetAllRoleNamesOfUserFailure>>>;
  updateUser(
    userId: string,
    userData: User,
  ): Promise<ServiceResponse<User, ServiceFailure<UpdateUserFailure>>>;
  updateStatusOfUser(
    userId: string,
    status: boolean,
  ): Promise<ServiceResponse<User, ServiceFailure<UpdateUserFailure>>>;
  changePassword(
    email: string,
    newPassword: string,
    oldPassword: string,
  ): Promise<ServiceResponse<ServiceFailure<ChangePasswordFailure>>>;
  getAllUsers(): Promise<ServiceResponse>;
  getSeller(userId: string): Promise<ServiceResponse<User, ServiceFailure<GetUserFailure>>>;
}

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IUserMailerSender') private userMailerReceiver: IUserMailerSender,
    @inject('IRoleRepository') private roleRepository: IRoleRepository,
    @inject('IRatingRepository') private ratingRepository: IRatingRepository,
  ) {}

  public async createUserWithRoleClient(
    userData: User,
  ): Promise<ServiceResponse<User, ServiceFailure<CreateUserFailure>>> {
    const autoGeneratedPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await hashPassword(autoGeneratedPassword);
    const clientRoleId = (await this.roleRepository.getIdRoleClient())._id;
    const user = {
      ...userData,
      activatedUser: true,
      password: hashedPassword,
      role: [clientRoleId],
    };

    const userExisted = await this.userRepository.getUserByEmail(user.email);

    if (userExisted) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: CreateUserFailure.UserAlreadyExists},
      };
    }

    const createdUser = await this.userRepository.create(user as User);

    await this.userMailerReceiver.receiveDefaultPassword(user.email, autoGeneratedPassword);

    return {status: ServiceResponseStatus.Success, result: createdUser};
  }

  public async getUserDetails(
    userId: string,
  ): Promise<ServiceResponse<any, ServiceFailure<GetUserFailure>>> {
    const user = await this.userRepository.getUserById(userId);
    const rating = await this.ratingRepository.getRatingOfUser(userId);

    let ratingAverage;

    if (rating.length === 0) {
      ratingAverage = 0;
    } else {
      const ratingOfUser = rating.map((ratingUser) => ratingUser.rating);

      ratingAverage = ratingOfUser.reduce((prev, curr) => prev + curr) / ratingOfUser.length;
    }
    const roleName: any = user['role'];
    const nameRole = roleName.map((i) => i.name);

    if (!user) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: GetUserFailure.UserNotFound},
      };
    }
    delete user.password;
    delete user._id;

    return {
      status: ServiceResponseStatus.Success,
      result: {
        ...user,
        role: nameRole,
        ratingAverage: ratingAverage,
        paypalEmail: config.paypalMail,
      },
    };
  }

  public async getSeller(
    userId: string,
  ): Promise<ServiceResponse<any, ServiceFailure<GetUserFailure>>> {
    const user = await this.userRepository.getUserById(userId);
    const rating = await this.ratingRepository.getRatingOfUser(userId);

    let ratingAverage;

    if (rating.length === 0) {
      ratingAverage = 0;
    } else {
      const ratingOfUser = rating.map((ratingUser) => ratingUser.rating);

      ratingAverage = ratingOfUser.reduce((prev, curr) => prev + curr) / ratingOfUser.length;
    }

    if (!user) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: GetUserFailure.UserNotFound},
      };
    }
    delete user.password;
    delete user._id;
    delete user.role;
    delete user.email;

    return {
      status: ServiceResponseStatus.Success,
      result: {...user, ratingAverage: ratingAverage, paypalEmail: config.paypalMail},
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

  public async updateUser(
    userId: string,
    userData: User,
  ): Promise<ServiceResponse<any, ServiceFailure<UpdateUserFailure>>> {
    const userExisted = await this.userRepository.getUserById(userId);

    if (!userExisted) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: UpdateUserFailure.UserNotFound},
      };
    }

    await this.userRepository.updateUserById(userId, userData);
    const updatedUser = await this.getUserDetails(userId);

    return {
      status: ServiceResponseStatus.Success,
      result: updatedUser,
    };
  }

  public async updateStatusOfUser(
    userId: string,
    status: boolean,
  ): Promise<ServiceResponse<User, ServiceFailure<UpdateUserFailure>>> {
    const userExisted = await this.userRepository.getUserById(userId);

    if (!userExisted) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: UpdateUserFailure.UserNotFound},
      };
    }

    const updatedUser = await this.userRepository.updateStatusOfUser(userId, status);

    return {
      status: ServiceResponseStatus.Success,
      result: updatedUser,
    };
  }

  public async changePassword(
    email: string,
    newPassword: string,
    oldPassword: string,
  ): Promise<ServiceResponse<ServiceFailure<ChangePasswordFailure>>> {
    const user = await this.userRepository.getUserByEmail(email);
    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatched) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: ChangePasswordFailure.IncorrectPassword},
      };
    }

    const hashedPassword = await hashPassword(newPassword);

    await this.userRepository.changePassword(email, hashedPassword);

    return {
      status: ServiceResponseStatus.Success,
    };
  }

  public async getAllUsers(): Promise<ServiceResponse> {
    const users = await this.userRepository.getAllUsers();
    const ratingOfAllUsers = await this.ratingRepository.getRatingOfAllUsers();

    const usersLists = [];

    for (const index in users) {
      let ratingOfUser = 0;
      const roleName: any = users[index]['role'];
      const nameRole = roleName.map((role) => role.name);

      if (index < ratingOfAllUsers.length) {
        for (const i in users) {
          if (users[i]._id.toString() == ratingOfAllUsers[index]._id.toString()) {
            const rating = ratingOfAllUsers[index].ratings.map((temp) => temp.rating);

            ratingOfUser = rating.reduce((prev, curr) => prev + curr) / rating.length;
          }
        }
      }
      const userDetails = {
        userId: users[index]['_id'],
        email: users[index]['email'],
        name: users[index]['name'],
        phone: users[index]['phone'],
        address: users[index]['address'],
        role: nameRole,
        ratingAverage: ratingOfUser,
      };

      usersLists.push(userDetails);
    }

    return {
      result: usersLists,
      status: ServiceResponseStatus.Success,
    };
  }
}
