// import
const express = require('express');

const authController = require('../controllers/auth');
const authLogController = require('../controllers/authLogin');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authLogController.login);

module.exports = router;
