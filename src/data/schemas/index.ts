import {ExtractDoc} from 'ts-mongoose';

import {RatingSchema} from './rating';
import {RoleSchema} from './role';
import {UserSchema} from './User';

export type User = ExtractDoc<typeof UserSchema>;
export type Role = ExtractDoc<typeof RoleSchema>;
export type Rating = ExtractDoc<typeof RatingSchema>;

export function modelDefs() {
  return [
    {name: nameof<User>(), schema: UserSchema},
    {name: nameof<Role>(), schema: RoleSchema},
    {name: nameof<Rating>(), schema: RatingSchema},
  ];
}
