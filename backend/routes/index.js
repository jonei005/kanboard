var express = require('express');
var router = express.Router();

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
  if (data.email.length === 0 || data.password.length === 0 || data.confirm.length === 0) {
    console.log("Register: Some field is empty...");
    return res.status(400).send("Empty");
  }

  if (data.password !== data.confirm) {
    console.log("Register: Passwords don't match...");
    return res.status(400).send("Matching");
  }

  if (data.password.length < 6) {
    console.log("Register: Password is too short...");
    return res.status(400).send("Length");
  }

  // add user to database

  // send token? authentication?? what???

  res.status(200).json({message: "Successfully signed up as " + data.email});
});

// for handling pre-flight requests for registration (needed?)
router.options('/register', function(req, res, next) {
  res.set('access-control-allow-origin', '*')
  return res.status(200);
});

module.exports = router;
