import {Type, createSchema} from 'ts-mongoose';

import {UserSchema} from './User';

export const RatingSchema = createSchema(
  {
    userId: Type.ref(Type.objectId()).to('User', UserSchema),
    ratingUserId: Type.ref(Type.objectId()).to('User', UserSchema),
    rating: Type.number({required: true}),
  },
  {versionKey: false},
);
