const express = require('express');
const router = express.Router();
const { register, login, solicitarRecuperacion, restablecerPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', solicitarRecuperacion);
router.post('/reset-password', restablecerPassword);

module.exports = router; 
