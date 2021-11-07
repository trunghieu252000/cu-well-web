import {createSchema, Type} from 'ts-mongoose';
export const RoleSchema = createSchema(
  {
    name: Type.string({required: true}),
  },
  {timestamps: true, versionKey: false, strict: false, strictQuery: true},
);
