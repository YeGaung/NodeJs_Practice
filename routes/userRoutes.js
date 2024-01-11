const express = require('express');
const userService = require('../services/userService');

const router = express.Router();

router
    .route('/')
    .get(userService.getAllUsers)
    .post(userService.validateSignUpUser, userService.signUpUser);

router
    .param('id', userService.checkLoggedInUser);

router
    .route('/:id')
    .get(userService.getUserById);

router
    .route('/:id/favGotCharacter')
    .get(userService.getUserFavGotCharacter);

module.exports = router;