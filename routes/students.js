const express = require('express');
const router = express.Router();
const connection = require('../connection');

/* GET data student */
router.get('/', function(req, res, next) {
  // Do the query to get data.
  connection.query('SELECT * FROM tbl_student', function(err, rows, fields) {
    if (err) {
      res.status(500).json({"status_code": 500,"status_message": err});
    } else {
      res.render('index', {title: 'Student List', data: rows});
    }
  });
});

module.exports = router;