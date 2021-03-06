import swaggerUi from 'swagger-ui-express';
import * as dotenv from 'dotenv';
dotenv.config();
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import {DbContext} from '../data/dbContext';

import * as swaggerDocument from './swagger.json';
import isAuth from './middlewares/isAuth';
import withCurrentUser from './middlewares/withCurrentUser';
import {interceptResponse} from './middlewares/interceptResponse';
import {IRequest, IResponse} from './types';
import {ServerErrorResult} from './httpResponses';
import container from './containerInstaller';
import adminRouter from './routes/adminRoute';
import userRouter from './routes/userRoute';
import authRouter from './routes/authRoute';
import roleRouter from './routes/roleRoute';
import ratingRouter from './routes/ratingRoute';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static('public'));

app.use(function (req, res, next) {
  console.info('REQUEST', req.method, req.url, req.body);
  next();
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(interceptResponse);

app.use('/api/auth', authRouter);
app.use(isAuth);
app.use(withCurrentUser);
app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/ratings', ratingRouter);

app.use((err, req: IRequest, res: IResponse, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.send({
      statusCode: 401,
      message: 'invalid token',
    });
  }

  console.error(err);
  if (res.headersSent) {
    next(err);
  }

  return res.send(
    ServerErrorResult({
      reason: 'ServerError',
      message: 'Server Error',
    }),
  );
});
export async function connectToDb(): Promise<void> {
  console.info('Connecting to Mongo server...');
  const context = container.resolve(DbContext);

  await context.connect({
    onConnected: () => {
      console.info('Mongo connected');
    },
    onError: (err) => {
      console.error('Error connecting to MongoDB', err);
      process.exit(1);
    },
  });
}

export default app;
