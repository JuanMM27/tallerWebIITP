const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByUser } = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Comprar requiere sesión iniciada (verifyToken).
router.post('/', verifyToken, createOrder);
router.get('/:userId', verifyToken, getOrdersByUser);

module.exports = router;
