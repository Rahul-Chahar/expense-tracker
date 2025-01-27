const router = require('express').Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middlewares/auth');

router.post('/add', auth, expenseController.addExpense);
router.get('/user', auth, expenseController.getExpenses);
router.delete('/:id', auth, expenseController.deleteExpense);
router.get('/report/:type', auth, expenseController.getReport);

module.exports = router;