import {inject, injectable} from 'tsyringe';

import {IUserRepository} from './../data/repositories/userRepository';
import {IRatingRepository} from './../data/repositories/ratingRepository';
import {ServiceResponse, ServiceFailure, ServiceResponseStatus} from './types/serviceResponse';

export enum GetRatingOfUserFailure {
  UserNotFound = 'UserNotFound',
}

export interface IRatingService {
  getRatingOfUser(
    userId: string,
  ): Promise<ServiceResponse<any, ServiceFailure<GetRatingOfUserFailure>>>;
  updateRatingOfUser(
    userId: string,
    ratingUserId: string,
    rating: number,
  ): Promise<ServiceResponse<any, ServiceFailure<GetRatingOfUserFailure>>>;
}

@injectable()
export class RatingService implements IRatingService {
  constructor(
    @inject('IRatingRepository') private ratingRepository: IRatingRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  public async getRatingOfUser(
    userId: string,
  ): Promise<ServiceResponse<any, ServiceFailure<GetRatingOfUserFailure>>> {
    const rating = await this.ratingRepository.getRatingOfUser(userId);

    if (rating === null) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: GetRatingOfUserFailure.UserNotFound},
      };
    }
    const ratingOfUser = rating.map((user) => user.rating);

    const ratingAverage = ratingOfUser.reduce((prev, curr) => prev + curr) / ratingOfUser.length;

    return {
      status: ServiceResponseStatus.Success,
      result: ratingAverage,
    };
  }

  public async updateRatingOfUser(
    userId: string,
    ratingUserId: string,
    rating: number,
  ): Promise<ServiceResponse<any, ServiceFailure<GetRatingOfUserFailure>>> {
    const existingUser = await this.userRepository.getUserById(userId);
    const existingRatingUser = await this.userRepository.getUserById(ratingUserId);

    if (existingUser === null || existingRatingUser === null) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: GetRatingOfUserFailure.UserNotFound},
      };
    }

    const ratingUpdated = await this.ratingRepository.updateRatingForUser(
      userId,
      ratingUserId,
      rating,
    );

    return {
      status: ServiceResponseStatus.Success,
      result: ratingUpdated,
    };
  }
}
