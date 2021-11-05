/* eslint-disable no-undef */
export default {
  connectionString: `mongodb+srv://cuwellpbl6:cuwellpbl6@cuwell.j87nz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  severDomain: process.env.SERVER_DOMAIN,
  frontEndDomain: process.env.FRONT_END_DOMAIN,
  secrectKeyResetPassword: 'cuwell-pbl6',
  jwt: {
    privateKey: 'cHJpdmF0ZUtleS1jdVdlbGw',
    issuer: 'cu-well',
    audience: 'client',
    tokenLifeTime: '720h',
  },
  adminMail: {
    admin: 'trunghieu252000@gmail.com',
  },
};
