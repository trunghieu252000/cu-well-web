import {inject, injectable} from 'tsyringe';

import {ServiceResponseStatus} from '../../services/types/serviceResponse';

import {NotFoundResult, BadRequestResult, OkResult, NoContentResult} from './../httpResponses';
import {IRequest, IResponse} from './../types/expressType';
import {AuthenticationFailure, IAuthService} from './../../services/authService';

@injectable()
export class AuthController {
  constructor(@inject('IAuthService') private authService: IAuthService) {
    this.login = this.login.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
  }

  public async login(req: IRequest, res: IResponse) {
    const {loginData} = req.body;

    const {result: token, status, failure} = await this.authService.authenticate(loginData);

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case AuthenticationFailure.UserNotFound:
          res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'User not found',
            }),
          );
          break;
        case AuthenticationFailure.ForBiddenAccess:
          res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'Forbidden Access',
            }),
          );
          break;
        case AuthenticationFailure.InvalidCredentials:
          res.send(
            BadRequestResult({
              reason: failure.reason,
              message: 'Invalid email or password',
            }),
          );
          break;
      }
    }

    return res.send(OkResult(token));
  }

  public async forgotPassword(req: IRequest, res: IResponse) {
    const {email} = req.body;

    if (!email) {
      return res.send(
        BadRequestResult({
          reason: AuthenticationFailure.BadRequest,
          message: 'Email is required',
        }),
      );
    }

    const {status, failure} = await this.authService.sendResetPasswordEmail(email);

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case AuthenticationFailure.InvalidCredentials:
          res.send(
            BadRequestResult({
              reason: AuthenticationFailure.InvalidCredentials,
              message: 'Invalid Email',
            }),
          );
      }
    }
    res.send(NoContentResult());
  }
}
