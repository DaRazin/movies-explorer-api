const router = require('express').Router();

const {
  getMyProfile, updateUserData,
} = require('../controllers/users');

const { validUserUpdate } = require('../middlewares/validator');

router.get('/users/me', getMyProfile);
router.patch('/users/me', validUserUpdate, updateUserData);

module.exports = router;
