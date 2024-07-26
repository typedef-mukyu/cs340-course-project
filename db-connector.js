var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_xxx',
    password: 'xxxx',
    database: 'cs340_xxx'
});

module.exports.pool = pool;