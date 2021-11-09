import {ExtractDoc} from 'ts-mongoose';
import {injectable} from 'tsyringe';
import {Model} from 'mongoose';

import {Role} from '../schemas';

import {DbContext} from './../dbContext';
import {IRepositoryBase, RepositoryBase} from './repositoryBase';
import {RoleSchema} from './../schemas/role';

export type RoleDocument = ExtractDoc<typeof RoleSchema>;
export interface IRoleRepository extends IRepositoryBase<Role, RoleDocument> {
  getRoleDetails(roleId: string): Promise<Role>;
  getAllRoles(): Promise<Role[]>;
  checkRoleExistence(roleName: string): Promise<Role>;
  getIdRoleClient(): Promise<Role>;
}

@injectable()
export class RoleRepository extends RepositoryBase<Role, RoleDocument> implements IRoleRepository {
  constructor(context: DbContext) {
    super(context);
  }

  protected get model(): Model<RoleDocument> {
    return this.context.model<RoleDocument>(nameof<Role>());
  }

  public async getRoleDetails(roleId: string): Promise<Role> {
    return await this.model.findById(roleId).lean().exec();
  }

  public async getAllRoles(): Promise<Role[]> {
    return await this.model.find().lean().exec();
  }

  public async checkRoleExistence(roleName: string): Promise<Role> {
    return await this.model.findOne({name: roleName}).lean().exec();
  }

  public async getIdRoleClient(): Promise<Role> {
    return await this.model.findOne({name: 'Client'}).lean().exec();
  }
}
