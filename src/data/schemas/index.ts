import {ExtractDoc} from 'ts-mongoose';

import {RoleSchema} from './role';
import {UserSchema} from './User';

export type User = ExtractDoc<typeof UserSchema>;
export type Role = ExtractDoc<typeof RoleSchema>;

export function modelDefs() {
  return [
    {name: nameof<User>(), schema: UserSchema},
    {name: nameof<Role>(), schema: RoleSchema},
  ];
}
