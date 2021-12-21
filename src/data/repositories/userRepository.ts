import {injectable} from 'tsyringe';
import mongoose from 'mongoose';
import {ExtractDoc} from 'ts-mongoose';

import {UserSchema} from '../schemas/User';
import {User} from '../schemas';
import {DbContext} from '../dbContext';

import {RepositoryBase, IRepositoryBase} from './repositoryBase';

export type UserDocument = ExtractDoc<typeof UserSchema>;
export interface IUserRepository
  extends IRepositoryBase<User, UserDocument, mongoose.AggregatePaginateModel<UserDocument>> {
  getUserById(id: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User>;
  changePassword(email: string, newPassword: string): Promise<User>;
  getRoleNameByUserId(userId: string): Promise<string[]>;
  updateUserById(userId: string, user: User): Promise<User>;
  updateStatusOfUser(userId: string, status: boolean): Promise<User>;
  statisticUserCreated(): Promise<any>;
  statisticUserByPost(data: string[]): Promise<any>;
}
@injectable()
export class UserRepository
  extends RepositoryBase<User, UserDocument, mongoose.AggregatePaginateModel<UserDocument>>
  implements IUserRepository {
  constructor(context: DbContext) {
    super(context);
  }

  protected get model(): mongoose.AggregatePaginateModel<UserDocument> {
    return this.context.model<UserDocument>(
      nameof<User>(),
    ) as mongoose.AggregatePaginateModel<UserDocument>;
  }

  public async getUserById(id: string): Promise<User> {
    return await this.model
      .findById(id)
      .populate('role', 'name')
      .select('-activatedUser -createdAt -updatedAt -__v')
      .lean()
      .exec();
  }

  public async getUserByEmail(email: string): Promise<User> {
    return await this.model
      .findOne({email})
      .populate('role', 'name')
      .select('-activatedUser -createdAt -updatedAt -__v')
      .lean()
      .exec();
  }

  public async statisticUserByPost(data: string[]): Promise<any> {
    return await this.model.find({_id: data}).lean().exec();
  }

  public async getAllUsers(): Promise<User[]> {
    return await this.model
      .find()
      .populate('role', 'name')
      .select('-password -activatedUser -createdAt -updatedAt -__v');
  }

  public async changePassword(email: string, newPassword: string): Promise<User> {
    return await this.model.findOneAndUpdate({email}, {password: newPassword});
  }

  public async getRoleNameByUserId(userId: string): Promise<string[]> {
    return await this.model.findById(userId).populate('role', 'name').lean().exec();
  }

  public async updateUserById(userId: string, user: User): Promise<User> {
    return await this.model.findByIdAndUpdate(userId, user, {new: true}).lean().exec();
  }

  public async updateStatusOfUser(userId: string, status: boolean): Promise<User> {
    return await this.model
      .findByIdAndUpdate(userId, {activatedUser: status}, {new: true})
      .lean()
      .exec();
  }

  private getFirstAndLastDayOfYear(year: number): {firstDay: Date; lastDay: Date} {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);

    return {firstDay, lastDay};
  }

  public async statisticUserCreated(): Promise<any> {
    const today = new Date();
    const year = today.getFullYear();
    const {firstDay, lastDay} = this.getFirstAndLastDayOfYear(year);
    const user = this.model.aggregate([
      {
        $match: {
          createdAt: {
            $gte: firstDay,
            $lt: lastDay,
          },
        },
      },
      {
        $group: {
          _id: {
            month: {$month: '$createdAt'},
          },
          count: {$sum: 1},
        },
      },
    ]);

    return user;
  }
}
