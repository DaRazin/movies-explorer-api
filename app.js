const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const routesUsers = require('./routes/users');
const routesMovies = require('./routes/movies');
const auth = require('./middlewares/auth');
const {
  createUser, login,
} = require('./controllers/users');
const { validCreateUser, validlogin } = require('./middlewares/validator');
const NotFoundError = require('./errors/not-found-err');
const { reqLogger, errLogger } = require('./middlewares/logger');

const { PORT, DB_URL } = process.env;

mongoose.connect(DB_URL);
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(reqLogger);

app.use((req, res, next) => {
  req.user = {
    _id: '64f5881a32859a2274408880', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };

  next();
});

app.post('/signin', validlogin, login);
app.post('/signup', validCreateUser, createUser);
app.use(auth, routesUsers);
app.use(auth, routesMovies);
app.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});
app.use(errLogger);
app.use(errors());
app.use((err, req, res, next) => {
  const { message } = err;
  res.status(err.statusCode).send({
    message: err.statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
  next();
});
app.listen(PORT, () => {
  console.log(`Application is running on port ${PORT}`);
});
