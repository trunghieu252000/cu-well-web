import {Request, Response} from 'express';

export interface IRequest extends Request {
  token: any;
  user: any;
  role: any;
}
export type IResponse = Response;
