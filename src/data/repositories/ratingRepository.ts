import {injectable} from 'tsyringe';
import {ExtractDoc} from 'ts-mongoose';
import {Model} from 'mongoose';

import {Rating} from '../schemas';
import {RatingSchema} from '../schemas/rating';

import {DbContext} from './../dbContext';
import {IRepositoryBase, RepositoryBase} from './repositoryBase';

export type RatingDocument = ExtractDoc<typeof RatingSchema>;

export interface IRatingRepository extends IRepositoryBase<Rating, RatingDocument> {
  getRatingOfUser(userId: string): Promise<any>;
  updateRatingForUser(userId: string, ratingUserId: string, rating: number): Promise<any>;
  getRatingOfAllUsers(): Promise<any>;
}

@injectable()
export class RatingRepository
  extends RepositoryBase<Rating, RatingDocument>
  implements IRatingRepository {
  constructor(context: DbContext) {
    super(context);
  }

  protected get model(): Model<RatingDocument> {
    return this.context.model<RatingDocument>(nameof<Rating>());
  }

  public async getRatingOfUser(userId: string): Promise<any> {
    const ratingOfUser = await this.model.find({userId}).lean().exec();

    return ratingOfUser;
  }

  public async getRatingOfAllUsers(): Promise<any> {
    // const ratingOfAllUsers = await this.model.find().lean().exec();
    const ratingOfAllUsers = await this.model.aggregate([
      {
        $group: {
          _id: '$userId',
          ratings: {
            $push: '$$ROOT',
          },
        },
      },
    ]);

    return ratingOfAllUsers;
  }

  public async updateRatingForUser(
    userId: string,
    ratingUserId: string,
    rating: number,
  ): Promise<any> {
    await this.model
      .update({userId: userId, ratingUserId: ratingUserId}, {rating: rating}, {upsert: true})
      .lean()
      .exec();
  }
}
