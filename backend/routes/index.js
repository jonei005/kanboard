var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');
var jwt = require('jsonwebtoken');

const db = require('../db');
const config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Kanboard' });
});


// LOGIN REQUESTS
router.post('/login', function(req, res, next) {
  console.log(req.body);

  var queryString = 'SELECT user_id, user_email, user_password, user_name, \
    user_bio, user_company, user_position, user_location \
    FROM Users WHERE user_email=$1';
  
  db.query(queryString, [req.body.email], (err, result) => {
    if (err) {
      console.log('Error getting user on login', err);
      res.status(500).json({message: 'Server error. Try again later.', success: false});
      return;
    }
    if (result.rows.length > 0) {
      var user = result.rows[0];
      bcrypt.compare(req.body.password, user.user_password, (err, result) => {
        if (err) {
          console.log('Error comparing passwords on login', err);
          res.status(500).json({message: 'Server error. Try again later.', success: false});
          return;
        }
        if (result) {
          // Log in succeeded

          // Create JWT
          var payload = {user_id: user.user_id};
          var options = {expiresIn: 86400}; // expire in 24 hours

          var token = jwt.sign(payload, config.secret, options);

          // clear password from user to prepare it to be sent to client
          delete user.user_password;
          res.status(200).json({
            message: 'Login succeeded!', 
            success: true, 
            user: user,
            token: token
          });

          return;
        }
        else {
          res.status(401).json({message: 'Invalid password.', success: false});
        }
      });
    }
    else {
      res.status(401).json({message: 'Email address not found.', success: false});
      return;
    }
  });
});


// REGISTER REQUESTS
router.post('/register', function(req, res, next) {

  if (!req.body) {
    console.log("No body in request.");
    return res.sendStatus(400);
  }

  var data = req.body;

  // validate credentials
  if (data.email.length === 0 || 
    data.name.length === 0 ||
    data.password.length === 0 || 
    data.confirm.length === 0) {
    console.log("Register: Some field is empty...");
    return res.status(400).json({message: "Empty"});
  }

  if (data.password !== data.confirm) {
    console.log("Register: Passwords don't match...");
    return res.status(400).json({message: "Matching"});
  }

  if (data.password.length < 6) {
    console.log("Register: Password is too short...");
    return res.status(400).json({message: "Length"});
  }

  // encrypt password with bcrypt
  bcrypt.hash(data.password, 10, (err, hash) => {
    if (err) {
      console.log('Error hashing password on sign up: ', err);
    }
    else {
      // add user to database
      var queryData = [data.email, data.name, hash];
      var queryString = "INSERT INTO Users (user_email, user_name, user_password) VALUES ($1, $2, $3) RETURNING *";

      db.query(queryString, queryData, (err, results) => {
          if (err) {
            console.log("Error inserting User to database:", err);
            return res.status(400).json({message: "Database error"});
          }

          // create user variable to store relevent information for sending to client
          var user = {
            user_id: results.rows[0].user_id,
            user_email: results.rows[0].user_email,
            user_name: results.rows[0].user_name,
          }

          // store message and user into a JSON object to send to client
          var myResponse = {
            message: "Successfully signed up as " + data.email,
            user: user
          }

          // send response status to frontend
          console.log("Successful registration! User ID: " + user.user_id);
          res.status(200).json(myResponse);

          // now that response is sent, we can create a new board for the user to use

          // this really long string is the query responsible for:
          // 1: inserting a new board called 'My First Board'
          // 2: inserting a BoardOwners entry to map this user to the new board
          // 3: inserting 3 new columns for use in the new board
          // 4: inserting a BoardsToColumns entry to map the new columns to the new board
          var queryStringCTE = " \
            WITH board_id as ( \
              INSERT INTO Boards (board_name) \
                VALUES ($1) \
                RETURNING board_id \
            ), user_id as ( \
              INSERT INTO BoardOwners (user_id, board_id) \
                VALUES ($2, (SELECT board_id FROM board_id LIMIT 1)) \
                RETURNING user_id \
            ), column_id as ( \
              INSERT INTO Columns (column_name, column_position) \
                VALUES ('Backlog', 0), ('In Progress', 1), ('Completed', 2) \
                RETURNING column_id \
            ) \
            INSERT INTO BoardsToColumns (board_id, column_id) \
              VALUES \
                  ((SELECT board_id FROM board_id LIMIT 1), (SELECT column_id FROM column_id LIMIT 1)), \
                  ((SELECT board_id FROM board_id LIMIT 1), (SELECT column_id FROM column_id OFFSET 1 LIMIT 1)), \
                  ((SELECT board_id FROM board_id LIMIT 1), (SELECT column_id FROM column_id OFFSET 2 LIMIT 1)) \
              RETURNING *; \
          ";

          db.query(queryStringCTE, ['My First Board', user.user_id], (err, results) => {
            if (err) {
              console.log("Error with CTE insert", err);
              //return res.status(400).json({message: "Database error"});
              return;
            }

            // console.log(results.rows);
            return;

          });
        }
      );
    }
  });
});

// for handling pre-flight requests for registration (needed?)
router.options('/register', function(req, res, next) {
  res.set('access-control-allow-origin', '*')
  return res.status(200);
});

// GET USER REQUESTS
// used to verify that a token is correct and send user data (such as on page refresh)
router.post('/user', function(req, res) {
  if (!req.body) {
    return res.status(500).json({
      message: 'Error: No request body.',
      auth: false
    });
  }

  if (!req.body.token) {
    return res.status(200).json({
      message: 'No user token.',
      auth: false
    });
  }

  var token = req.body.token;
  
  try {
    var decoded = jwt.verify(token, config.secret);
  }
  catch (err) {
    return res.status(200).json({
      message: 'User token invalid.',
      error: err,
      auth: false
    });
  }

  // get user data from database based on user_id in token
  var queryString = 'SELECT user_id, user_email, user_name, \
    user_bio, user_company, user_position, user_location \
    FROM Users WHERE user_id=$1';
  
  db.query(queryString, [decoded.user_id], (err, result) => {
    if (err) {
      console.log('Error getting user with token', err);

      return res.status(500).json({
        message: 'Error getting user from DB with token.',
        auth: false
      });
    }

    var user = result.rows[0];

    // send user data back to client
    return res.status(200).json({
      message: 'User token is valid.',
      user: user,
      auth: true
    });

  });

});

// SEND USER BOARDS
// used to verify token and send list of user boards (for use in the dashboard page)
router.post('/boards', function(req, res) {
  if (!req.body) {
    return res.status(500).json({
      message: 'Error: No request body.',
      auth: false
    });
  }

  if (!req.body.token) {
    return res.status(200).json({
      message: 'No user token.',
      auth: false
    });
  }

  var token = req.body.token;
  
  try {
    var decoded = jwt.verify(token, config.secret);
  }
  catch (err) {
    return res.status(200).json({
      message: 'User token invalid.',
      error: err,
      auth: false
    });
  }

  // get list of user's boards based on user_id
  var queryString = 'WITH myboards AS (SELECT board_id FROM BoardOwners WHERE user_id = $1) \
    SELECT board_id, board_name FROM Boards WHERE board_id IN (SELECT board_id FROM myboards)';

  db.query(queryString, [decoded.user_id], (err, result) => {
    if (err) {
      console.log('Error getting boards from database with user token', err);

      return res.status(500).json({
        message: 'Error getting boards from DB with token.',
      });
    }  

    return res.status(200).json({
      message: 'Found ' + result.rows.length + ' boards.',
      boards: JSON.stringify(result.rows)
    });


  });
});

module.exports = router;
