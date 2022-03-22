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

router.get('/', getCard);
router.post('/', createCardValid, createCard);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId', auth, deleteCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
