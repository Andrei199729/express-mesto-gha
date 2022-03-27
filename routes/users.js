const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  userAvatarValid,
  parameterIdValid,
  userValid,
} = require('../middlewares/validationJoi');

const {
  getUser,
  getUserId,
  updateUserInfo,
  updateAvatar,
  getUserMe,
} = require('../controllers/users');

router.get('/', auth, getUser);
router.get('/:userId', auth, parameterIdValid('cardId'), getUserId);
router.get('/me', auth, getUserMe);
router.patch('/me', auth, userValid, updateUserInfo);
router.patch('/me/avatar', userAvatarValid, updateAvatar);

module.exports = router;
