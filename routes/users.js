const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  userAvatarValid,
} = require('../middlewares/validationJoi');

const {
  getUser,
  getUserId,
  updateUserInfo,
  updateAvatar,
  getUserMe,
} = require('../controllers/users');

router.get('/', auth, getUser);
router.get('/:userId', auth, getUserId);
router.get('/me', auth, getUserMe);
router.patch('/me', auth, userAvatarValid, updateUserInfo);
router.patch('/me/avatar', userAvatarValid, updateAvatar);

module.exports = router;
