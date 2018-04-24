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

// SEND BOARD DETAILS
// used to send all board details (columns, cards, etc) to client
router.post('/board/:id', auth.authenticate, function(req, res) {
  
  // get user_id from token (middleware) and board_id from route path
  var user_id = res.locals.decodedToken.user_id;
  var board_id = req.params.id;

  // TODO: verify in query that user_id is an owner or member of the board


  // this query gets all columns, separate from cards so I can easily get the column_ids
  var queryString1 = " \
    SELECT * FROM Boards \
      INNER JOIN BoardsToColumns ON BoardsToColumns.board_id = Boards.board_id \
      INNER JOIN Columns ON Columns.column_id = BoardsToColumns.column_id \
    WHERE Boards.board_id = $1 \
  ";

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
        board_name: result.rows[0].board_name,
        board_description: result.rows[0].board_description
      };

      // cut out unnecessary keys in columnData (not really needed, but nice to have)
      for (var i = 0; i < columnData.length; i++) {
        delete columnData[i]['board_id'];
        delete columnData[i]['board_name'];
        delete columnData[i]['board_position'];
        delete columnData[i]['board_description'];
      }

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
router.post('/renameboard/:board_id', auth.authenticate, function(req, res, next) {

  // TODO: make sure user is board owner before renaming

  var queryString = 'UPDATE Boards SET board_name = $1 WHERE board_id = $2 RETURNING *';

  db.query(queryString, [req.body.new_board_name, req.params.board_id], (err, results) => {
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

    // console.log('Successfully deleted board ' + req.body.board_id);
    return res.status(200).json({message: 'Board deleted successfully'});
  });
});

router.post('/updateboard/description/:board_id', auth.authenticate, function(req, res) {
  var queryString = " \
    UPDATE Boards SET board_description = $1 WHERE board_id = $2 RETURNING * \
  ";

  var queryParameters = [req.body.board_description, req.params.board_id];

  db.query(queryString, queryParameters, (err, result) => {
    if (err) {
      console.log('Error with update board description query', err);
      return res.status(500).json({message: 'Database error on board description update'});
    }

    return res.status(200).json({
      message: 'Board description updated successfully',
      board_description: result.rows[0].board_description
    })
  });
})

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

  // in query: get position of column to delete (curPos)
  // get associated board using BoardsToColumns
  // select all Columns associated with that board in BoardsToColumns with pos > curPos
  // decrement pos of all these columns by 1

  // delete associated BoardsToColumns, Columns, ColumnsToCards, and Cards
  var queryString = " \
    WITH my_column AS ( \
      DELETE FROM BoardsToColumns WHERE column_id = $1 RETURNING * \
    ), my_column_full AS ( \
      DELETE FROM Columns WHERE column_id = (SELECT column_id FROM my_column LIMIT 1) RETURNING * \
    ), card_ids AS ( \
      DELETE FROM ColumnsToCards WHERE column_id = (SELECT column_id FROM my_column LIMIT 1) RETURNING card_id \
    ), cards AS ( \
      DELETE FROM Cards WHERE card_id IN (SELECT * FROM card_ids) RETURNING card_id \
    ), my_board_id AS ( \
      SELECT board_id FROM BoardsToColumns WHERE column_id = (SELECT column_id FROM my_column LIMIT 1) \
    ), after_columns_ids AS ( \
      SELECT column_id FROM BoardsToColumns WHERE board_id = (SELECT board_id FROM my_board_id LIMIT 1) \
    ), after_columns AS ( \
      SELECT * FROM Columns WHERE column_id IN (SELECT column_id FROM after_columns_ids) \
    ), columns_to_move AS ( \
      SELECT * FROM after_columns WHERE column_position > (SELECT column_position FROM my_column_full LIMIT 1)  \
    ), moved_columns AS ( \
      UPDATE Columns SET column_position = column_position - 1 WHERE column_id IN (SELECT column_id FROM columns_to_move) RETURNING * \
    ) SELECT card_id FROM cards \
  ";

  db.query(queryString, [req.params.column_id], (err, result) => {
    if (err) {
      console.log('Error with delete column query', err);
      return res.status(500).json({message: 'Database error on column deletion'});
    }

    console.log("Deleted cards: ", result.rows);

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
router.post('/deletecard/:card_id', auth.authenticate, function(req, res) {
  // steps:
  // delete card from ColumnsToCards, get column_id
  // delete card from Cards, get position
  // decrement position of all Cards in same column after this card

  var card_id = req.params.card_id;

  var queryString = ' \
    WITH my_column AS ( \
      DELETE FROM ColumnsToCards WHERE card_id = $1 RETURNING * \
    ), my_card AS ( \
      DELETE FROM Cards WHERE card_id = $1 RETURNING * \
    ), update_cards AS ( \
      SELECT * FROM ColumnsToCards WHERE column_id = (SELECT column_id FROM my_column LIMIT 1) \
    ) UPDATE Cards SET card_position = card_position - 1 \
      WHERE card_id IN (SELECT card_id FROM update_cards) \
      AND card_position > (SELECT card_position FROM my_card LIMIT 1) \
      RETURNING * \
  ';

  db.query(queryString, [card_id], (err, result) => {
    if (err) {
      console.log('Error with delete card query', err);
      return res.status(500).json({message: 'Database error on card delete'});
    }

    res.status(200).json({
      message: 'Card deleted successfully, updated position of ' + result.rows.length + ' cards.',
    });
  });
})


// MOVE CARD
router.post('/movecard/:card_id', auth.authenticate, function(req, res) {
  // steps:
  // * change ColumnsToCards, old_column_id to new_column_id
  // * find all cards in old_column_id that came after this card
  //   and decrement their positions
  // * change card_position of current card to 0
  // * find all cards in new_column_id and increment their position
  
  var old_column_id = req.body.old_column_id;
  var new_column_id = req.body.new_column_id;
  var new_position = req.body.new_position;
  var old_position = req.body.old_position;

  var queryString = '';
  var queryParameters = [];

  if (old_column_id === new_column_id) {
    // no need to update ColumnsToCards, only update one column's card positions
    console.log("Same column");

    if (new_position < old_position) {
      // new position < old position
      // increment values >= new position AND < old position
      queryString = ' \
        WITH my_card AS ( \
          UPDATE Cards SET card_position = $1 WHERE card_id = $2 RETURNING * \
        ), update_card_ids AS ( \
          SELECT * FROM ColumnsToCards WHERE column_id = $3 AND card_id <> $2 \
        ) UPDATE Cards SET card_position = card_position + 1 \
          WHERE card_id IN (SELECT card_id FROM update_card_ids) \
          AND card_position < $4 \
          AND card_position >= $1 \
          RETURNING * \
      ';

      queryParameters = [
        new_position, 
        req.params.card_id,
        old_column_id,
        old_position
      ];
    }
    else {
      // new position > old position
      // decrement values <= new position AND > old position
      queryString = ' \
        WITH my_card AS ( \
          UPDATE Cards SET card_position = $1 WHERE card_id = $2 RETURNING * \
        ), update_card_ids AS ( \
          SELECT * FROM ColumnsToCards WHERE column_id = $3 AND card_id <> $2 \
        ) UPDATE Cards SET card_position = card_position - 1 \
          WHERE card_id IN (SELECT card_id FROM update_card_ids) \
          AND card_position > $4 \
          AND card_position <= $1 \
          RETURNING * \
      ';

      queryParameters = [
        new_position - 1, 
        req.params.card_id,
        old_column_id,
        old_position
      ];
    }

  }
  else {
    console.log("New column");


    // update card position for moved card (given in req body)
    // update ColumnsToCards to reflect new column
    // get all cards that are in the new column AFTER cards new position
    //   increment position for all of these cards
    // get all cards that are in the old column AFTER cards old position
    //   decrement position for all of these cards

    queryString = ' \
      WITH my_card AS ( \
        UPDATE Cards SET card_position = $1 WHERE card_id = $2 RETURNING * \
      ), update_column AS ( \
        UPDATE ColumnsToCards SET column_id = $3 WHERE card_id = $2 RETURNING *  \
      ), update_card_ids_new AS ( \
        SELECT * FROM ColumnsToCards WHERE column_id = $3 AND card_id <> $2 \
      ), update_cards_new AS ( \
        SELECT * FROM Cards WHERE card_id IN (SELECT card_id FROM update_card_ids_new) \
      ), updated_cards_new AS ( \
        UPDATE Cards SET card_position = card_position + 1 \
          WHERE card_id IN (SELECT card_id FROM update_cards_new) \
          AND card_position >= $1 \
        RETURNING * \
      ), update_card_ids_old AS ( \
        SELECT * FROM ColumnsToCards WHERE column_id = $4 \
      ), update_cards_old AS ( \
        SELECT * FROM Cards WHERE card_id IN (SELECT card_id FROM update_card_ids_old) \
      ) UPDATE Cards SET card_position = card_position - 1 \
          WHERE card_id IN (SELECT card_id FROM update_cards_old) \
          AND card_position > $5 \
        RETURNING * \
    ';

    queryParameters = [
      new_position,
      req.params.card_id,
      new_column_id,
      old_column_id,
      old_position
    ];
  }

  db.query(queryString, queryParameters, (err, result) => {
    if (err) {
      console.log('Error with move card query', err);
      return res.status(500).json({message: 'Database error on card move'});
    }

    res.status(200).json({
      message: 'Card moved successfully',
      results: result.rows
    });
  });
});

// UPDATE CARD INFO
router.post('/updatecard/:update_type/:card_id', auth.authenticate, function(req, res) {
  var queryString = '';
  var queryParameters = [];
  
  // based on update type given in url, we must write a custom query
  switch(req.params.update_type) {
    case 'rename':
      queryString = 'UPDATE Cards SET card_name = $1 WHERE card_id = $2 RETURNING card_name';
      queryParameters = [req.body.new_card_name, req.params.card_id];
      break;

    case 'description':
      queryString = 'UPDATE Cards SET card_description = $1 WHERE card_id = $2 RETURNING card_description';
      queryParameters = [req.body.new_card_description, req.params.card_id];
      break;

    case 'addcomment':
      var comment = req.body.new_comment;
      comment.timestamp = Date.now();
      queryString = 'UPDATE Cards SET card_comments = card_comments || $1::jsonb WHERE card_id = $2 RETURNING card_comments';
      queryParameters = [JSON.stringify(comment), req.params.card_id];
      break;

    case 'duedate':
      queryString = 'UPDATE Cards SET card_due = $1 WHERE card_id = $2 RETURNING card_due';
      queryParameters = [req.body.due_date, req.params.card_id];
      break;

    case 'priority':
      queryString = 'UPDATE Cards SET card_priority = $1 WHERE card_id = $2 RETURNING card_priority';
      queryParameters = [req.body.card_priority, req.params.card_id];
      break;

    case 'tags':
      queryString = 'UPDATE Cards SET card_tags = $1 WHERE card_id = $2 RETURNING card_tags';
      queryParameters = [req.body.card_tags, req.params.card_id];
      break;

    default:
      break;
  }

  // if queryString or queryParameters are not overwritten, there must be some error
  if (queryString === '' || queryParameters.length === 0) {
    return res.status(500).json({message: 'Unrecognized card update type'});
  }

  db.query(queryString, queryParameters, (err, result) => {
    if (err) {
      console.log('Error with rename card query', err);
      return res.status(500).json({message: 'Database error on card update'});
    }

    res.status(200).json({
      message: 'Card updated successfully',
      result: result.rows[0]
    });
  });
});

module.exports = router;
