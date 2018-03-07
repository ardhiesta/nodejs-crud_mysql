var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "pass",
  database: "db_student"
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

///
/// HTTP Method	: GET
/// Endpoint 	: /person
/// 
/// To get collection of person saved in MySQL database.
///
app.get('/students', function(req, res) {
  var studentList = [];

  // Do the query to get data.
  con.query('SELECT * FROM tbl_student', function(err, rows, fields) {
    if (err) {
      res.status(500).json({"status_code": 500,"status_message": "internal server error"});
    } else {
      console.log(rows);

      // Loop check on each row
      for (var i = 0; i < rows.length; i++) {

        // Create an object to save current row's data
        var student = {
          'student_id':rows[i].student_id,
          'name':rows[i].name,
          'address':rows[i].address,
          'gender':rows[i].gender,
          'date_of_birth':rows[i].date_of_birth
        }
        // Add object into array
        studentList.push(student);
    }

    // Render index.pug page using array 
    res.render('index', {title: 'Student List', data: studentList});
    }
  });

  con.end();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
