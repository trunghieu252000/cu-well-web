import {inject, injectable} from 'tsyringe';

import {CreateRoleFailure, GetRoleFailure, IRoleService} from '../../services/roleService';
import {IRequest, IResponse} from '../types';

import {ConflictResult, OkResult, NotFoundResult} from './../httpResponses';
import {ServiceResponseStatus} from './../../services/types/serviceResponse';

@injectable()
export class RoleController {
  constructor(@inject('IRoleService') private roleService: IRoleService) {
    this.createRole = this.createRole.bind(this);
    this.getAllRoles = this.getAllRoles.bind(this);
    this.getRoleDetails = this.getRoleDetails.bind(this);
  }

  public async createRole(req: IRequest, res: IResponse) {
    const {role} = req.body;

    const {result: newRole, status, failure} = await this.roleService.createRole(role);

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case CreateRoleFailure.RoleAlreadyExisted:
          return res.send(
            ConflictResult({
              reason: failure.reason,
              message: 'Role is already existed',
            }),
          );
      }
    }

    return res.send(OkResult(newRole));
  }

  public async getAllRoles(req: IRequest, res: IResponse) {
    const roles = await this.roleService.getAllRoles();

    return res.send(OkResult(roles));
  }

  public async getRoleDetails(req: IRequest, res: IResponse) {
    const {roleId} = req.params;

    const {result: role, status, failure} = await this.roleService.getRoleDetails(roleId);

    if (status === ServiceResponseStatus.Failed) {
      switch (failure.reason) {
        case GetRoleFailure.RoleNotFound:
          return res.send(
            NotFoundResult({
              reason: failure.reason,
              message: 'User not found',
            }),
          );
      }
    }

    return res.send(OkResult(role));
  }
}
