const express = require('express');
const authService = require('./../services/authService')

const router = express.Router();

router
    .route('/login')
    .post(authService.loginPrerequistieCheck, authService.login);

module.exports = router;