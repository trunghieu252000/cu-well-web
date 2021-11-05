/* eslint-disable prefer-rest-params */
export function interceptResponse(req, res, next) {
  const oldSend = req.send;

  res.send = function (data) {
    if (data.statusCode === undefined) {
      return;
    }

    res.status(data.statusCode);
    console.info('RESPONSE', req.method, req.originalUrl, data);
    res.send = oldSend;

    oldSend.apply(res, arguments);
  };

  next();
}
