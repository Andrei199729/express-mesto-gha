const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorConflict = require('../errors/ErrorConflict');
const Unauthorized = require('../errors/Unauthorized');

module.exports.getUser = (req, res, next) => {
  Users.find({})
    .then((user) => res.status(200).send({ data: user }))
    .catch((err) => next(err));
};

module.exports.getUserId = (req, res, next) => {
  Users.findById(req.params.userId)
    .orFail(() => {
      throw new ErrorNotFound('Пользователь не найден');
    })
    .then((user) => {
      if (!user) {
        throw new ErrorNotFound('Пользователь не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      if (err.statusCode === 404) {
        return res.status(404).send({ message: err.errorMessage });
      }
      return next(err);
    });
};

module.exports.getUserMe = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  Users.find({
    name,
    about,
    avatar,
    email,
    password,
  })
    .then((user) => {
      if (!user) {
        throw new ErrorNotFound('Пользователь не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.statusCode === 404) {
        return res.status(404).send({ message: err.errorMessage });
      }
      return next(err);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  Users.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ErrorConflict(`Пользователь с таким email ${email} уже зарегистрирован`);
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => Users.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => Users.findOne({ _id: user._id })) // прячет пароль
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(409).send({ message: err.errorMessage });
      }
      return next(err);
    });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  Users.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => {
      throw new ErrorNotFound('Пользователь не найден');
    })
    .then((user) => {
      if (!user) {
        throw new ErrorNotFound('Пользователь не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      if (err.statusCode === 404) {
        return res.status(404).send({ message: err.errorMessage });
      }
      return next(err);
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  Users.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => {
      throw new ErrorNotFound('Пользователь не найден');
    })
    .then((user) => {
      if (!user) {
        throw new ErrorNotFound('Пользователь не найден');
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некорректные данные' });
      }
      if (err.statusCode === 404) {
        return res.status(404).send({ message: err.errorMessage });
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  Users.findOne({ email }, '+password')
    .then((user) => {
      if (!user) {
        throw new Unauthorized('Не правильный логин или пароль');
      }
      return bcrypt.compare(password, user.password);
    })
    .then((isValid) => {
      if (!isValid) {
        throw new Unauthorized('Не правильный логин или пароль');
      }
      const token = jwt.sign({ email }, 'some-secret-key', { expiresIn: '7d' });
      // вернём токен
      res.send({ jwt: token });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(401).send({ message: err.errorMessage });
      }
      return next(err);
    });
};
