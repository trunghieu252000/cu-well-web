import jwt from 'express-jwt';

import config from '../../config';

const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0].toLowerCase() === 'bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
};

const isAuth = jwt({
  secret: config.jwt.privateKey, // The _secret_ to sign the JWTs
  userProperty: 'token', // this is where the next middleware can find the encoded data generated in services/auth:generateToken
  getToken: getTokenFromHeader, // How to extract the JWT from the request
});

export default isAuth;
