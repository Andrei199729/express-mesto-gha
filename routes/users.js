const router = require('express').Router();
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const {
  registerValid,
  loginValid,
  userAvatarValid,
} = require('../middlewares/validationJoi');

const {
  getUser,
  getUserId,
  updateUserInfo,
  updateAvatar,
  getUserMe,
} = require('../controllers/users');

router.post('/signup', registerValid, createUser);
router.post('/signin', loginValid, login);

router.get('/', auth, getUser);
router.get('/:userId', getUserId);
router.get('/me', getUserMe);
router.patch('/me', updateUserInfo);
router.patch('/me/avatar', userAvatarValid, updateAvatar);

module.exports = router;
