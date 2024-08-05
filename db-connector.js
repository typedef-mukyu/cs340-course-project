var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_xxxx',
    password: 'xxxx',
    database: 'cs340_xxxx'
});

module.exports.pool = pool;