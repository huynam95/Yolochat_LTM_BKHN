const express = require('express');
const loginController = require('./../controllers/loginController');

const router = express.Router();

router.route('/').post(loginController.loginUser);
router.route('/').get(loginController.logoutUser);

module.exports = router;
