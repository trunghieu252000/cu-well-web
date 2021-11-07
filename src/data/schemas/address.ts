import {createSchema, Type} from 'ts-mongoose';

export const AddressSchema = createSchema(
  {
    commune: Type.string({required: true}),
    district: Type.string({required: true}),
    city: Type.string({required: true}),
    status: Type.string({required: true}),
  },
  {timestamps: true, versionKey: false, strict: false, strictQuery: true},
);
