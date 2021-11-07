import {ValidationResult} from '../validators/validator';

export interface ServiceResponse<TResult = any, TFailure extends ServiceFailure = any> {
  status: ServiceResponseStatus;
  validationResult?: ValidationResult;
  failure?: TFailure;
  result?: TResult;
}

export enum ServiceResponseStatus {
  Success = 'Success',
  Failed = 'Failed',
  ValidationFailed = 'ValidationFailed',
}

export interface ServiceFailure<TReason = any> {
  reason: TReason;
  message?: any;
}
