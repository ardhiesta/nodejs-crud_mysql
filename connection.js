const mysql = require('mysql');
const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];
const connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.db_name
});

module.exports = connection;