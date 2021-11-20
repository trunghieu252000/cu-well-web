import {createSchema, Type} from 'ts-mongoose';

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
    role: Type.array().of(Type.ref(Type.objectId()).to('Role', RoleSchema)),
    address: {
      city: Type.string({required: true}),
      district: Type.string({required: true}),
      commune: Type.string({required: true}),
    },
    activatedUser: Type.boolean({required: true}),
  },
  {timestamps: true, versionKey: false, strict: false, strictQuery: true},
);

UserSchema.set('toJSON', {virtuals: true});
