const express = require('express');
const router = express.Router();
const connection = require('../connection');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Do the query to get data.
  connection.query('SELECT * FROM tbl_student', function(err, rows, fields) {
    if (err) {
      res.status(500).json({"status_code": 500,"status_message": "internal server error"});
    } else {
      res.json(rows);
    }
  });
});

module.exports = router;