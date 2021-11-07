import {createSchema, Type} from 'ts-mongoose';

import {AddressSchema} from './address';
import {RoleSchema} from './role';

export enum Role {
  Admin = 'Admin',
  Employee = 'Employee',
}

export const UserSchema = createSchema(
  {
    email: Type.string({
      required: true,
      unique: true,
      match: [/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
    }),
    password: Type.string({required: true}),
    name: Type.string({required: true}),
    phone: Type.string({required: true}),
    status: Type.string({required: true}),
    role: Type.array().of(Type.ref(Type.objectId()).to('Role', RoleSchema)),
    ratingAverage: Type.array().of(Type.objectId()),
    addressId: Type.ref(Type.objectId({required: true})).to('Address', AddressSchema),
    activatedUser: Type.boolean({required: true}),
  },
  {timestamps: true, versionKey: false, strict: false, strictQuery: true},
);

UserSchema.set('toJSON', {virtuals: true});
