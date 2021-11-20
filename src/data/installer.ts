import {DependencyContainer} from 'tsyringe';

import {IRatingRepository, RatingRepository} from './repositories/ratingRepository';
import {DbContext} from './dbContext';
import {IRoleRepository, RoleRepository} from './repositories/roleRepository';
import {IUserRepository, UserRepository} from './repositories/userRepository';

export async function install(container: DependencyContainer) {
  container
    .registerSingleton<DbContext>(DbContext)
    .register<IUserRepository>('IUserRepository', {useClass: UserRepository})
    .register<IRatingRepository>('IRatingRepository', {useClass: RatingRepository})
    .register<IRoleRepository>('IRoleRepository', {
      useClass: RoleRepository,
    });
}
