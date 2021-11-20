import {inject, injectable} from 'tsyringe';
import mongoose from 'mongoose';

import {ServiceResponseStatus} from '../../services/types/serviceResponse';

import {NotFoundResult, OkResult} from './../httpResponses';
import {IRequest, IResponse} from './../types/expressType';
import {GetRatingOfUserFailure, IRatingService} from './../../services/ratingService';

@injectable()
export class RatingController {
  constructor(@inject('IRatingService') private ratingService: IRatingService) {
    this.updateRatingForUser = this.updateRatingForUser.bind(this);
    this.getRatingOfUser = this.getRatingOfUser.bind(this);
  }

  public async getRatingOfUser(req: IRequest, res: IResponse) {
    const userId =
      req.params.userId.match(/^[0-9a-fA-F]{24}$/) && mongoose.Types.ObjectId(req.params.userId);

    if (!userId) {
      return res.send(
        NotFoundResult({
          reason: GetRatingOfUserFailure.UserNotFound,
          message: 'User not found',
        }),
      );
    }
    const {result: ratingOfUser, status, failure} = await this.ratingService.getRatingOfUser(
      userId.toHexString(),
    );

    console.log('userId.toHexString(): ', userId.toHexString());
    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case GetRatingOfUserFailure.UserNotFound:
          return res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'User not found',
            }),
          );
      }
    }

    return res.send(OkResult(ratingOfUser));
  }

  public async updateRatingForUser(req: IRequest, res: IResponse) {
    const {ratingData} = req.body;
    const {result: ratingUpdated, status, failure} = await this.ratingService.updateRatingOfUser(
      ratingData.userId,
      ratingData.ratingUserId,
      ratingData.rating,
    );

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case GetRatingOfUserFailure.UserNotFound:
          return res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'User not found',
            }),
          );
      }
    }

    return res.send(OkResult(ratingUpdated));
  }
}
