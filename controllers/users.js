const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;
const IncorrectDataError = require('../errors/incorrect-data-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictEmailError = require('../errors/conflict-email-err');

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    })
      .then((user) => res.status(201).send({
        name: user.name,
        email: user.email,
      }))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return next(new IncorrectDataError('Переданы некорректные данные при создании пользователя'));
        }
        if (err.code === 11000) {
          return next(new ConflictEmailError('Переданы некорректные данные при создании пользователя'));
        } else {
          next(err);
        }
      }));
};

module.exports.updateUserData = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  User.findByIdAndUpdate(userId, { name, email }, { runValidators: true, new: true })
    .then((users) => {
      if (!users) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      return res.send(users);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new IncorrectDataError('Переданы некорректные данные при обновлении информации пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports.getMyProfile = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      next(err);
    });
};
