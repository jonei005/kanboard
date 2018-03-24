var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var passport = require('passport');

const db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// LOGIN REQUESTS
router.post('/login', function(req, res, next) {
  console.log("Someone wants to login...");
  console.log(req.body);
  res.status(200).json({message: "I think this worked!"});
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
            console.log("Error inserting User to database:");
            console.log(err);
            return res.status(400).json({message: "Database error"});
          }

          var user = {
            user_id: results.rows[0].user_id,
            user_email: results.rows[0].user_email,
            user_name: results.rows[0].user_name,
          }

          // send response status to frontend
          var myResponse = {
            message: "Successfully signed up as " + data.email,
            user: user
          }

          console.log("Successful registration! User ID: " + user.user_id);
          res.status(200).json(myResponse);
        }
      );

      
    }
  });

  // finally send response status and message to frontend
  // res.status(200).json({message: "Successfully signed up as " + data.email});
});

// for handling pre-flight requests for registration (needed?)
router.options('/register', function(req, res, next) {
  res.set('access-control-allow-origin', '*')
  return res.status(200);
});

module.exports = router;
