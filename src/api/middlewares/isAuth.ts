import jwt from 'express-jwt';

import config from '../../config';

const getTokenFromHeader = (req) => {
  if (req.headers.authorization && req.authorization.split(' ')[0].toLowerCase == 'bearer') {
    return req.headers.authorization.split(' ')[1];
  }
};

const isAuth = jwt({
  secret: config.jwt.privateKey, // the secret key to sign the JWT
  userProperty: 'token', // this is where the next middleware can find the encoded data generated in services/auth: generateToken
  getToken: getTokenFromHeader,
});

console.log('ngu vcl');

export default isAuth;
