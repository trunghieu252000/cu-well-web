import {createSchema, Type} from 'ts-mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

export enum Role {
  Admin = 'Admin',
  HR = 'HR',
  Employee = 'Employee',
  LineManager = 'LineManager',
  Finance = 'Finance',
}

export const UserSchema = createSchema(
  {
    email: Type.string({
      required: true,
      unique: true,
      match: [/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address'],
    }),
    password: Type.string({required: true}),
    activatedUser: Type.boolean({required: true}),
  },
  {timestamps: true},
).plugin(aggregatePaginate);

UserSchema.set('toJSON', {virtuals: true});
