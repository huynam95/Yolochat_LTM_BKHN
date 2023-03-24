const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

exports.loginUser = async (req, res) => {
  const { username, password, room } = req.body;
  console.log(room);

  if (username && password) {
    // Execute SQL query that'll select the account from the database based on the specified username and password
    db.query(
      'SELECT * FROM accounts WHERE username = ?',
      [username],
      async function (error, results, fields) {
        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
          console.log(results[0].username, results[0].password);
          const verified = await bcrypt.compare(password, results[0].password);

          if (verified) {
            // Authenticate the user
            req.session.loggedin = true;
            req.session.username = username;

            console.log(req.session);

            const accessToken = jwt.sign(
              {
                id: results[0].id,
              },
              'access_secret_no_one_can_know_about_this',
              { expiresIn: 60 * 60 }
            );

            res.cookie('accessToken', accessToken, {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000, //equivalent to 1 day
            });

            const data = {
              token: accessToken,
              id: results[0].id,
              username: results[0].username,
              avatar: '',
              is_block: '',
            };

            const url = `chat.html?username=${results[0].username}&room=${room}`;

            res.redirect(url);

            // res.status(200).json({
            //   status: 'Success',
            //   message: 'Logged in',
            //   data,
            // });
          } else {
            res.status(400).json({
              status: 'Failed',
              message: 'Incorrect Username and/or Password!',
            });
          }
        }
        res.end();
      }
    );
  } else {
    res.send('Please enter Username and Password!');
    res.end();
  }
};
exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check of it's there
    const token = req.cookies['accessToken'];
    // if (
    //   req.headers.authorization &&
    //   req.headers.authorization.startsWith('Bearer')
    // ) {
    //   token = req.headers.authorization.split(' ')[1];
    // }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    // Verify the token using jwt.verify method
    const decode = await jwt.verify(
      token,
      'access_secret_no_one_can_know_about_this'
    );

    res.locals.decodeID = decode.id;

    next();
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: 'You are not logged in',
    });
  }
};
exports.logoutUser = async (req, res) => {
  if (req.cookies.accessToken !== 'no-token') {
    res.cookie('accessToken', 'no-token', {
      httpOnly: true,
      expires: new Date(Date.now() + 10 * 1000),
    });
    res.status(200).json({
      status: 'Success',
      message: 'Logged out',
    });
  } else {
    res.status(400).json({
      status: 'error',
      message: 'You are not logged in',
    });
  }
};

exports.changeUsername = async (req, res) => {};
