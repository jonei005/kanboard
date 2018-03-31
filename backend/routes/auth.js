// Middleware for authenticating user tokens before accessing API
var jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {
    authenticate: (req, res, next) => {
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
        
        // decode token into usable data (only user_id is inside token)
        // get user_id with 'decoded.user_id'
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
    
        res.locals.decodedToken = decoded;
        res.locals.auth = true;
        next();
    }
}