import {ExtractDoc} from 'ts-mongoose';

import {UserSchema} from './user';

export type User = ExtractDoc<typeof UserSchema>;

export function modelDefs() {
  return [{name: nameof<User>(), schema: UserSchema}];
}
