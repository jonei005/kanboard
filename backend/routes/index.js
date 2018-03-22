var express = require('express');
var router = express.Router();

const db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// handle login requests
router.post('/login', function(req, res, next) {
  console.log("Someone wants to login...\n");
  // handle login attempt

  // validate credentials

  // send token? or something?
});

// handle registration requests
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

  // add user to database
  var queryData = [data.email, data.name, data.password];
  var queryString = "INSERT INTO Users (user_email, user_name, user_password) VALUES ($1, $2, $3)";

  db.query(queryString, queryData, (err, response) => {
      if (err) {
        console.log("Error inserting User to database:");
        console.log(err);
        return res.status(400).json({message: "Database error"});
      }
    }
  );

  // send token? authentication?? what???

  res.status(200).json({message: "Successfully signed up as " + data.email});
});

// for handling pre-flight requests for registration (needed?)
router.options('/register', function(req, res, next) {
  res.set('access-control-allow-origin', '*')
  return res.status(200);
});

module.exports = router;
