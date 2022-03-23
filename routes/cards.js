const router = require('express').Router();
const auth = require('../middlewares/auth');
const {
  createCardValid,
} = require('../middlewares/validationJoi');
const {
  getCard,
  createCard,
  likeCard,
  dislikeCard,
  deleteCard,
} = require('../controllers/cards');

router.get('/', auth, getCard);
router.post('/', auth, createCardValid, createCard);
router.put('/:cardId/likes', auth, likeCard);
router.delete('/:cardId', auth, deleteCard);
router.delete('/:cardId/likes', auth, dislikeCard);

module.exports = router;
