import {DependencyContainer} from 'tsyringe';

import {IUserMailerSender, UserMailerReceiver} from './mailer';

export function install(container: DependencyContainer) {
  container.register<IUserMailerSender>('IUserMailerSender', {
    useClass: UserMailerReceiver,
  });
}
