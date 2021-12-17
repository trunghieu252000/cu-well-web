/* eslint-disable no-undef */
export default {
  connectionString: `mongodb+srv://cuwellpbl6:cuwellpbl6@cuwell.j87nz.mongodb.net/cu-well?retryWrites=true&w=majority`,
  severDomain: process.env.SERVER_DOMAIN,
  frontEndDomain: process.env.FRONT_END_DOMAIN,
  secretKeyResetPassword: 'cuwell-pbl6',
  jwt: {
    privateKey: 'cHJpdmF0ZUtleS1jdVdlbGw',
    issuer: 'cu-well',
    audience: 'client',
    tokenLifeTime: '360h',
  },
  adminMail: {
    admin: 'doanpbl6cuwell@gmail.com',
  },
  mailer: {
    host: 'smtp.gmail.com',
    port: 465,
    user: 'cuwellpbl6@gmail.com',
    pass: 'Cuwell@9999',
  },
  paypalMail: 'cuwellpbl6@gmail.com',
};