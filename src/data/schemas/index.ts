import {ExtractDoc} from 'ts-mongoose';

import {AddressSchema} from './address';
import {RoleSchema} from './role';
import {UserSchema} from './user';

export type User = ExtractDoc<typeof UserSchema>;
export type Role = ExtractDoc<typeof RoleSchema>;
export type Address = ExtractDoc<typeof AddressSchema>;

export function modelDefs() {
  return [
    {name: nameof<User>(), schema: UserSchema},
    {name: nameof<Role>(), schema: RoleSchema},
    {name: nameof<Address>(), schema: AddressSchema},
  ];
}
