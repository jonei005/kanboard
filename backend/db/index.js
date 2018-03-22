const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'kanboard',
    password: 'kanboard15',
    port: 5432
});

module.exports = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    }
};