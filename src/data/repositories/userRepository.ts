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
    return await this.model.findById(id).lean().exec();
  }

  public async getUserByEmail(email: string): Promise<User> {
    return await this.model.findOne({email}).lean().exec();
  }

  public async getAllUsers(): Promise<User[]> {
    return await this.model.find();
  }

  public async changePassword(email: string, newPassword: string): Promise<User> {
    return await this.model.findOneAndUpdate({email}, {password: newPassword});
  }

  public async getRoleNameByUserId(userId: string): Promise<string[]> {
    return await this.model.findById(userId).populate('role', 'name').lean().exec();
  }
}
