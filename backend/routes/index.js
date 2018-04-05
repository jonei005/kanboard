var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const db = require('../db');
const config = require('../config');
var auth = require('./auth');


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
          var options = {expiresIn: '7d'}; // expire in 1 week

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

          // console.log("Successful registration! User ID: " + user.user_id);

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
              return res.status(400).json({message: "Database error"});
            }

            // console.log(results.rows);
            return res.status(200).json(myResponse);;

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
router.post('/user', auth.authenticate, function(req, res) {
  
  // decoded token provided by middleware
  var decodedToken = res.locals.decodedToken;

  // get user data from database based on user_id in token
  var queryString = 'SELECT user_id, user_email, user_name, \
    user_bio, user_company, user_position, user_location \
    FROM Users WHERE user_id=$1';
  
  db.query(queryString, [decodedToken.user_id], (err, result) => {
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
router.post('/boards', auth.authenticate, function(req, res) {

  // decoded token provided by middleware
  var decodedToken = res.locals.decodedToken;

  // get list of user's boards based on user_id
  var queryString = 'WITH myboards AS (SELECT board_id FROM BoardOwners WHERE user_id = $1) \
    SELECT board_id, board_name, board_position FROM Boards WHERE board_id IN (SELECT board_id FROM myboards) ORDER BY board_position ASC';

  db.query(queryString, [decodedToken.user_id], (err, result) => {
    if (err) {
      console.log('Error getting boards from database with user token', err);

      return res.status(500).json({
        message: 'Error getting boards from DB with token.',
      });
    }  

    // send stringified array of boards to client
    return res.status(200).json({
      message: 'Found ' + result.rows.length + ' boards.',
      boards: JSON.stringify(result.rows)
    });


  });
});

// SEND USER BOARDS
// used to verify token and send single board (for use when creating a single board)
// CURRENTLY UNTESTED
// router.post('/boards/:id', auth.authenticate, function(req, res) {

//   var board_id = req.params.id;

//   // get single board based on user_id
//   var queryString = 'SELECT board_id, board_name FROM Boards WHERE board_id = $1';

//   db.query(queryString, [board_id], (err, result) => {
//     if (err) {
//       console.log('Error getting single board from database with user token', err);

//       return res.status(500).json({
//         message: 'Error getting boards from DB with token.',
//       });
//     }  

//     // send stringified array of boards to client
//     return res.status(200).json({
//       message: 'Successfully retrieved board with id ' + board_id,
//       boards: JSON.stringify(result.rows[0])
//     });
//   });
// });

// SEND BOARD DETAILS
// used to send all board details (columns, cards, etc) to client
router.post('/board/:id', auth.authenticate, function(req, res) {
  
  // get user_id from token (middleware) and board_id from route path
  var user_id = res.locals.decodedToken.user_id;
  var board_id = req.params.id;

  // TODO: verify in query that user_id is an owner or member of the board

  // Select a board that matches given board id
  // Include all BoardsToColumns mappings from this board to any columns
  // Include all Columns mapped to from BoardsToColumns
  // Include all ColumnsToCards mappings from this board's columns to any cards
  // Include all Cards mapped to from ColumnsToCards
  // var queryString = " \
  //   SELECT * FROM Boards \
  //     INNER JOIN BoardsToColumns ON BoardsToColumns.board_id = Boards.board_id \
  //     INNER JOIN Columns ON Columns.column_id = BoardsToColumns.column_id \
  //     LEFT JOIN ColumnsToCards ON ColumnsToCards.column_id = Columns.column_id \
  //     FULL JOIN Cards ON Cards.card_id = ColumnsToCards.card_id \
  //   WHERE Boards.board_id = $1 \
  // ";

  // this query gets all columns, separate from cards so I can easily get the column_ids
  var queryString1 = " \
    SELECT * FROM Boards \
      INNER JOIN BoardsToColumns ON BoardsToColumns.board_id = Boards.board_id \
      INNER JOIN Columns ON Columns.column_id = BoardsToColumns.column_id \
    WHERE Boards.board_id = $1 \
  ";

  // var queryString1 = " \
  //   WITH column_ids AS (SELECT column_id FROM BoardsToColumns WHERE board_id = $1) \
  //   SELECT * FROM Columns WHERE column_id IN (SELECT column_id FROM column_ids) \
  // ";


  db.query(queryString1, [board_id], (err, result) => {
    if (err) {
      console.log('Error retrieving board columns from database', err);
      return res.status(500).json({message: 'Error retrieving board columns from database'});
    }

    console.log('Found board ' + board_id);
    
    // get result of columns query (with joins)
    var columnData = result.rows;

    // Get all column_ids from last query for use in next query
    var columnIdArray = [];
    for (var i = 0; i < result.rows.length; i++) {
      columnIdArray.push(result.rows[i].column_id);
    }

    // now that we have all columns, this query gets the cards mapped to each column based on column_id
    var queryString2 = " \
      SELECT * FROM Columns \
        INNER JOIN ColumnsToCards ON ColumnsToCards.column_id = Columns.column_id \
        INNER JOIN Cards ON Cards.card_id = ColumnsToCards.card_id \
      WHERE Columns.column_id = ANY ($1) \
    ";

    db.query(queryString2, [columnIdArray], (err2, result2) => {
      if (err2) {
        console.log('Error retrieving board cards from database', err);
        return res.status(500).json({message: 'Error retrieving board cards from database'});
      }

      // get result of cards query (with joins)
      var cardData = result2.rows;

      // get boardData from columns query results
      var boardData = {
        board_id: result.rows[0].board_id,
        board_name: result.rows[0].board_name
      };

      // cut out unnecessary keys in columnData (not really needed, but nice to have)
      for (var i = 0; i < columnData.length; i++) {
        delete columnData[i]['board_id'];
        delete columnData[i]['board_name'];
        delete columnData[i]['board_position'];
        delete columnData[i]['board_description'];
      }

      // v2
      // uses regex to delete board keys in case new ones are added (not working 100%)
      // var deleteBoardRegex = /(board_)\w+/g;
      // for (var i = 0; i < columnData.length; i++) {
      //   for (var key in columnData[i]) {
      //     if (columnData[i].hasOwnProperty(key) && deleteBoardRegex.test(key)) {
      //       console.log('key matched: ' + key);
      //       delete columnData[i][key];
      //     }
      //   }
      // }
        

      return res.status(200).json({
        message: 'Found board with board_id = ' + board_id,
        boardData: boardData,
        columnData: columnData,
        cardData: cardData
      });
    })
  });
});

// CREATE NEW BOARD
// based on given user_id, create a new board
// future: receive board_name to assign to the board
router.post('/createboard', auth.authenticate, function(req, res) {

  // decoded token provided by middleware
  var decodedToken = res.locals.decodedToken;

  // this really long string is the query responsible for:
  // 1: inserting a new board called 'My First Board'
  // 2: inserting a BoardOwners entry to map this user to the new board
  // 3: inserting 3 new columns for use in the new board
  // 4: inserting a BoardsToColumns entry to map the new columns to the new board
  var queryStringCTE = " \
    WITH board_id as ( \
      INSERT INTO Boards (board_name, board_position) \
        VALUES ($1, $2) \
        RETURNING board_id \
    ), user_id as ( \
      INSERT INTO BoardOwners (user_id, board_id) \
        VALUES ($3, (SELECT board_id FROM board_id LIMIT 1)) \
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

  var new_board_name = req.body.board_name;
  var new_board_position = req.body.board_position || 0;

  db.query(queryStringCTE, [new_board_name, new_board_position, decodedToken.user_id], (err, results) => {
    if (err) {
      console.log('Error with CTE insert', err);
      return res.status(400).json({message: 'Database error'});
    }

    console.log('New Board: ID=' + results.rows[0].board_id);

    // console.log(results.rows);
    return res.status(200).json({message: "Board Created!", board_id: results.rows[0].board_id});;

  });

});

// RENAME BOARD
// Receive string "board_name" and id "board_id"
// Set new name of board_id to board_name in DB
router.post('/renameboard', auth.authenticate, function(req, res, next) {

  // TODO: make sure user is board owner before renaming

  var queryString = 'UPDATE Boards SET board_name = $1 WHERE board_id = $2 RETURNING *';

  db.query(queryString, [req.body.new_board_name, req.body.board_id], (err, results) => {
    if (err) {
      console.log('Error with board rename query', err);
      return res.status(500).json({message: 'Database error'});
    }

    console.log('Renamed board ' + results.rows[0].board_id + ' to ' + results.rows[0].board_name);
    return res.status(200).json({
      message: 'Successfully renamed board',
      board_id: results.rows[0].board_id,
      board_name: results.rows[0].board_name
    });
  });
});

// DELETE BOARD
// receive board_id
// delete board_id from Boards, and consequent columns/cards in DB
router.post('/deleteboard/:board_id', auth.authenticate, function(req, res, next) {

  // TODO: make sure user is board owner before deleting
  // TODO: if user is not owner, just delete that user's mapping to the board
  //       else, delete the entire board and all remnants of it
  
  // Things to delete:
  // * Board
  // * BoardOwners or BoardUsers mapping
  // * BoardsToColumns mappings
  // * Columns in the board
  // * ColumnsToCards mappings
  // * Cards in each column

  // Sheesh

  var queryString = " \
    WITH my_board_id as ( \
      DELETE FROM Boards WHERE board_id = $1 RETURNING board_id \
    ), owner_id as ( \
      DELETE FROM BoardOwners WHERE board_id = (SELECT board_id FROM my_board_id LIMIT 1) RETURNING user_id \
    ), column_ids as ( \
      DELETE FROM BoardsToColumns WHERE board_id = (SELECT board_id FROM my_board_id LIMIT 1) RETURNING column_id \
    ), more_columns as ( \
      DELETE FROM Columns WHERE column_id IN (SELECT * FROM column_ids) RETURNING column_id \
    ), card_ids as ( \
      DELETE FROM ColumnsToCards WHERE column_id IN (SELECT * FROM column_ids) RETURNING card_id \
    ) DELETE FROM Cards WHERE card_id IN (SELECT * FROM card_ids) \
  ";

  db.query(queryString, [req.params.board_id], (err, result) => {
    if (err) {
      console.log('Error with delete query', err);
      return res.status(500).json({message: 'Database error on board deletion'});
    }

    console.log('Successfully deleted board ' + req.body.board_id);
    return res.status(200).json({message: 'Board deleted successfully'});
  });


});

// ADD COLUMN
// adds column data (found in req.body) to DB, associated with board_id given from pathname
router.post('/addcolumn/:board_id', auth.authenticate, function(req, res) {

  // add column to Columns, then BoardsToColumns
  var queryString = " \
    WITH my_column_id AS ( \
      INSERT INTO Columns (column_name, column_position) \
        VALUES ($1, $2) RETURNING column_id \
    ) \
    INSERT INTO BoardsToColumns (board_id, column_id) \
      VALUES ($3, (SELECT column_id FROM my_column_id LIMIT 1)) \
      RETURNING column_id \
  ";

  // parameters: column_name, column_position, board_id
  var queryParameters = [
    req.body.column_name,
    req.body.column_position,
    req.params.board_id
  ]

  db.query(queryString, queryParameters, (err, result) => {
    if (err) {
      console.log('Error with add column query', err);
      return res.status(500).json({message: 'Database error on column creation'});
    }

    var column_id = result.rows[0].column_id;

    console.log('Successfully added column ' + column_id + ' to board ' + req.params.board_id);
    return res.status(200).json({
      message: 'Column created successfully',
      column_id: column_id,
      success: true
    });
  });
});


// DELETE COLUMN
// deletes column based on its column_id (found in pathname)
router.post('/deletecolumn/:column_id', auth.authenticate, function(req, res) {

  // TODO: update positions of columns that came after it (how?)

  // delete associated BoardsToColumns, Columns, ColumnsToCards, and Cards
  var queryString = " \
    WITH my_column_id AS ( \
      DELETE FROM BoardsToColumns WHERE column_id = $1 RETURNING column_id \
    ), more_columns AS ( \
      DELETE FROM Columns WHERE column_id = (SELECT column_id FROM my_column_id LIMIT 1) RETURNING column_id \
    ), card_ids AS ( \
      DELETE FROM ColumnsToCards WHERE column_id = (SELECT column_id FROM my_column_id LIMIT 1) RETURNING card_id \
    ) DELETE FROM Cards WHERE card_id IN (SELECT * FROM card_ids) RETURNING card_id \
  ";

  db.query(queryString, [req.params.column_id], (err, result) => {
    if (err) {
      console.log('Error with delete column query', err);
      return res.status(500).json({message: 'Database error on column deletion'});
    }

    return res.status(200).json({
      message: 'Column deleted successfully. ' + result.rows.length + ' cards deleted.',
      numCards: result.rows.length,
      card_ids: result.rows
    });
  });
});


// RENAME COLUMN 
// get new name from req.body, update name of column_id in DB
router.post('/updatecolumn/name/:column_id', auth.authenticate, function(req, res) {

  // update Column name and position if those parameters are specified
  var queryString = 'UPDATE Columns SET column_name = $1 WHERE column_id = $2';
  var queryParameters = [req.body.column_name, req.params.column_id];

  db.query(queryString, queryParameters, (err, result) => {
    if (err) {
      console.log('Error with rename column query', err);
      return res.status(500).json({message: 'Database error on column rename'});
    }

    return res.status(200).json({
      message: 'Column renamed successfully.',
      success: true
    });
  });
});

// MOVE COLUMN
// router.post('/updatecolumn/move/:column_id', auth.authenticate, function(req, res) {
//   var queryString = '';
// })

// ADD CARD
// add new card to column
router.post('/addcard/:column_id', auth.authenticate, function(req, res) {

  // TODO: Check if user is verified member of board

  var queryString = ' \
    WITH my_card AS ( \
      INSERT INTO Cards (card_name, card_position) \
      VALUES ($1, $2) RETURNING * \
    ), my_column_id AS ( \
      INSERT INTO ColumnsToCards (column_id, card_id) \
      VALUES ($3, (SELECT card_id FROM my_card LIMIT 1)) RETURNING * \
    ) SELECT * FROM my_card \
        INNER JOIN my_column_id ON my_column_id.card_id = my_card.card_id \
  ';

  var queryParameters = [
    req.body.card_name,
    req.body.card_position,
    req.params.column_id
  ];

  db.query(queryString, queryParameters, (err, result) => {
    if (err) {
      console.log('Error with add card query', err);
      return res.status(500).json({message: 'Database error on card add'});
    }

    res.status(200).json({
      message: 'Successfully added card.',
      card: result.rows[0],
      success: true
    })
  });



});



// DELETE CARD


// UPDATE CARD (change name, add info, move columns, etc)

module.exports = router;
