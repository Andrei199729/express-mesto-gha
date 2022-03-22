const jwt = require('jsonwebtoken');
const Forbidden = require('../errors/Forbidden');

module.exports = (req, res, next) => {
  const token = String(req.headers.authorization).replace('Bearer ', '');

  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    // отправим ошибку, если не получилось
    return next(new Forbidden('Нет прав'));
  }
  req.user = payload;
  return next();
};
