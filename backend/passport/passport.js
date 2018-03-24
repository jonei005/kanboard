var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

const db = require('../db');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (username, password, callback) => {
    console.log("Trying to log in with email: " + username);
    // make the query 
    // TODO: Should get all user fields, not just these (bio, etc)
    db.query('SELECT user_id, user_email, user_password, user_name FROM Users WHERE user_email=$1', [email], (err, result) => {
        if (err) {
            console.log('Error getting user on login', err);
            return callback(err);
        }

        if (result.rows.length > 0) {
            const user = result.rows[0];
            
            bcrypt.compare(password, user.user_password, (err, res) => {
                if (res) {
                    callback(null, {
                        user_id: user.user_id,
                        user_email: user.user_email,
                        user_name: user.user_name
                    });
                }
                else {
                    callback(null, false);
                }
            });
        }
        else {
            callback(null, false);
        }
    })
}));

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser((user_id, callback) => {
    db.query('SELECT user_id, user_email, user_name FROM Users WHERE user_id=$1', [parseInt(user_id, 10)], (err, results) => {
        if (err) {
            console.log('Error when selecting user on session deserialize', err);
            return callback(err);
        }

        callback(null, results.rows[0]);
    })
})