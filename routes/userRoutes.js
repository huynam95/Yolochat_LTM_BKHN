const express = require('express');
const userController = require('./../controllers/userController');
const loginController = require('./../controllers/loginController');

const router = express.Router();

router.route('/').get(userController.signUp).post(userController.createUser);

router.route('/').patch(loginController.protect, userController.updateUser);

router
  .route('/:id')
  .get(loginController.protect, userController.getUser)
  .delete(userController.deleteUser);

module.exports = router;
