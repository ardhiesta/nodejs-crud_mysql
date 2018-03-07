var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "linuxluv",
  password: "linuxluv",
  database: "db_student"
});

/* GET home page. */
router.get('/', function(req, res, next) {
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    // query
    // con.query("SELECT * FROM tbl_student", function (err, result, fields) {
    //   if (err) throw err;
    //   console.log(result);
    // });
  });

  //res.render('index', { title: 'Express' });
  res.send('express');    
});

module.exports = router;
