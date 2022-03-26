const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/user');
const ErrorNotFound = require('../errors/ErrorNotFound');
const ErrorConflict = require('../errors/ErrorConflict');
const ValidationError = require('../errors/ValidationError');

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
        next(new ErrorNotFound('Пользователь не найден'));
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
        next(new ErrorNotFound('Пользователь не найден'));
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
        next(new ErrorConflict(`Пользователь с таким email ${email} уже зарегистрирован`));
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
      res.status(200 || 201).send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ErrorConflict('Переданы некорректные данные.'));
      } else if (err.code === 11000) {
        next(new ValidationError(`Данный email ${email}  уже существует`));
      } else {
        next(err);
      }
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
        next(new ErrorNotFound('Пользователь не найден'));
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
        next(new ErrorNotFound('Пользователь не найден'));
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
        next(new ValidationError('Не правильный логин или пароль'));
      }
      return bcrypt.compare(password, user.password);
    })
    .then((isValid) => {
      if (!isValid) {
        next(new ValidationError('Не правильный логин или пароль'));
      }
      const token = jwt.sign({ email }, 'some-secret-key', { expiresIn: '7d' });
      res.send({ jwt: token });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: err.errorMessage });
      }
      return next(err);
    });
};
