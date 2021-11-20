import {inject, injectable} from 'tsyringe';

import {Role} from '../data/schemas';

import {IRoleRepository} from './../data/repositories/roleRepository';
import {ServiceFailure, ServiceResponse, ServiceResponseStatus} from './types/serviceResponse';

export enum GetRoleFailure {
  RoleNotFound = 'RoleNotFound',
}
export enum CreateRoleFailure {
  RoleAlreadyExisted = 'RoleAlreadyExisted',
}

export interface IRoleService {
  createRole(role: Role): Promise<ServiceResponse<Role, ServiceFailure<CreateRoleFailure>>>;
  getRoleDetails(roleId: string): Promise<ServiceResponse<Role, ServiceFailure<GetRoleFailure>>>;
  getAllRoles(): Promise<ServiceResponse<Role[]>>;
}

@injectable()
export class RoleService implements IRoleService {
  constructor(@inject('IRoleRepository') private roleRepository: IRoleRepository) {}

  public async createRole(
    role: Role,
  ): Promise<ServiceResponse<Role, ServiceFailure<CreateRoleFailure>>> {
    const roleExisted = await this.roleRepository.checkRoleExistence(role.name);

    if (roleExisted) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: CreateRoleFailure.RoleAlreadyExisted},
      };
    }

    await this.roleRepository.create(role);

    return {
      status: ServiceResponseStatus.Success,
      result: role,
    };
  }

  public async getRoleDetails(
    roleId: string,
  ): Promise<ServiceResponse<Role, ServiceFailure<GetRoleFailure>>> {
    const role = await this.roleRepository.getRoleDetails(roleId);

    if (!role) {
      return {
        status: ServiceResponseStatus.Failed,
        failure: {reason: GetRoleFailure.RoleNotFound},
      };
    }

    return {
      status: ServiceResponseStatus.Success,
      result: role,
    };
  }

  public async getAllRoles(): Promise<ServiceResponse<Role[]>> {
    const roles = await this.roleRepository.getAllRoles();

    return {
      status: ServiceResponseStatus.Success,
      result: roles,
    };
  }
}
