import {DependencyContainer} from 'tsyringe';

import {AuthService, IAuthService} from './authService';
import {IRoleService, RoleService} from './roleService';
import {IUserService, UserService} from './userService';

export async function install(container: DependencyContainer) {
  container
    .register<IAuthService>('IAuthService', {
      useClass: AuthService,
    })
    .register<IUserService>('IUserService', {
      useClass: UserService,
    })
    .register<IRoleService>('IRoleService', {
      useClass: RoleService,
    });
}
