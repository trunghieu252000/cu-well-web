import {inject, injectable} from 'tsyringe';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import bcrypt from 'bcryptjs';

import config from '../config';
// import {IRoleRepository} from '../data/repositories/roleRepository';
import {IUserRepository} from '../data/repositories/userRepository';
import {User} from '../data/schemas';
import {hashPassword} from '../utils/password';
import {IUserMailerSender} from '../infrastructure/mailer';

import {AuthUserInformation} from './DTO/authDTO';
import {ServiceResponse, ServiceFailure, ServiceResponseStatus} from './types/serviceResponse';

interface IVerifyTokenResult {
  user: {
    id: string;
    email: string;
  };
}

export enum AuthenticationFailure {
  UserNotFound = 'UserNotFound',
  InvalidCredentials = 'InvalidCredentials',
  InvalidToken = 'InvalidToken',
  LoginNotAllowed = 'LoginNotAllowed',
  BadRequest = 'BadRequest',
  PasswordNotMatch = 'PasswordNotMatch',
  ForBiddenAccess = 'ForBiddenAccess',
}

export interface IAuthService {
  getUser(email: string): Promise<User>;
  authenticate(loginData: {
    email: string;
    password: string;
  }): Promise<ServiceResponse<string, ServiceFailure<AuthenticationFailure>>>;
  sendResetPasswordEmail(
    email: string,
  ): Promise<ServiceResponse<ServiceFailure<AuthenticationFailure>>>;
  verifyResetPasswordToken(
    token: string,
  ): Promise<ServiceResponse<IVerifyTokenResult, ServiceFailure<AuthenticationFailure>>>;
  resetPassword(resetPassword: {
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ServiceResponse<any, ServiceFailure<AuthenticationFailure>>>;
}

@injectable()
export class AuthService implements IAuthService {
  constructor(
    // @inject('IRoleRepository') private roleRepository: IRoleRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IUserMailerSender') private userMailerReceiver: IUserMailerSender,
  ) {}

  public async getUser(email: string): Promise<User> {
    return await this.userRepository.getUserByEmail(email);
  }

  public async verifyResetPasswordToken(
    token: string,
  ): Promise<ServiceResponse<IVerifyTokenResult, ServiceFailure<AuthenticationFailure>>> {
    try {
      const secret = config.secretKeyResetPassword;
      const result = await jwt.verify(token, secret);

      return {
        status: ServiceResponseStatus.Success,
        result: (result as any).user,
      };
    } catch (err) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: AuthenticationFailure.InvalidToken},
      };
    }
  }

  public async resetPassword(resetPassword: {
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ServiceResponse<any, ServiceFailure<AuthenticationFailure>>> {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    }).options({abortEarly: false});

    try {
      await schema.validateAsync(resetPassword);
    } catch (error) {
      return {
        status: ServiceResponseStatus.ValidationFailed,
        validationResult: {
          valid: false,
          failures: error.details,
        },
      };
    }
    const user = await this.userRepository.getUserByEmail(resetPassword.email);

    if (!user) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: AuthenticationFailure.UserNotFound},
      };
    }
    if (resetPassword.password !== resetPassword.confirmPassword) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {
          reason: AuthenticationFailure.PasswordNotMatch,
        },
      };
    }

    const hashedPassword = await hashPassword(resetPassword.password);

    await this.userRepository.update(user._id.toString(), {password: hashedPassword});

    return {status: ServiceResponseStatus.Success};
  }

  public async authenticate(loginData: {
    email: string;
    password: string;
  }): Promise<ServiceResponse<string, ServiceFailure<AuthenticationFailure>>> {
    const user = await this.userRepository.getUserByEmail(loginData.email);

    if (!user) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: AuthenticationFailure.UserNotFound},
      };
    }
    if (user.activatedUser === false) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: AuthenticationFailure.ForBiddenAccess},
      };
    }
    const isMatch = await bcrypt.compare(loginData.password, user.password);

    if (!isMatch) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: AuthenticationFailure.InvalidCredentials},
      };
    }

    const role = await this.userRepository.getRoleNameByUserId(user._id.toString());
    const roleName = role['role'];
    const nameRole = roleName.map((i) => i.name);
    const tokenData = {
      id: user._id.toHexString(),
      email: user.email,
      role: nameRole,
      name: user.name,
    };

    console.log('tokenData: ', tokenData);
    const token = this.generateToken(tokenData);

    return {
      status: ServiceResponseStatus.Success,
      result: token,
    };
  }

  public async sendResetPasswordEmail(
    email: string,
  ): Promise<ServiceResponse<ServiceFailure<AuthenticationFailure>>> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: AuthenticationFailure.UserNotFound},
      };
    }
    const role = await this.userRepository.getRoleNameByUserId(user._id.toString());
    const roleName = role['role'];
    const nameRole = roleName.map((i) => i.name);
    const tokenData = {
      id: user._id.toHexString(),
      email: user.email,
      role: nameRole,
      name: user.name,
    };

    const secret = config.secretKeyResetPassword;
    const token = this.generateToken(tokenData, secret, '30m');

    console.log('token: ', token);

    try {
      await this.userMailerReceiver.receiveOnResetPassword(user.email, token);
    } catch (err) {
      return {
        status: ServiceResponseStatus.Failed,
      };
    }

    return {
      status: ServiceResponseStatus.Success,
    };
  }

  private generateToken(
    user: AuthUserInformation,
    privateKey: string = config.jwt.privateKey,
    expiresIn: string = config.jwt.tokenLifeTime,
  ) {
    return jwt.sign(
      {
        user: {id: user.id, email: user.email},
        role: user.role,
        name: user.name,
      },
      privateKey,
      {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
        expiresIn: expiresIn,
      },
    );
  }
}
