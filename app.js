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
  user: "linuxluv",
  password: "linuxluv",
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

// function formatDateForPug(date) {
//   var d = new Date(date),
//       month = '' + (d.getMonth() + 1),
//       day = '' + d.getDate(),
//       year = d.getFullYear();

//   if (month.length < 2) month = '0' + month;
//   if (day.length < 2) day = '0' + day;

//   return [month, day, year].join('/');
// }

// function formatDateForMySQL(date) {
//   var d = new Date(date),
//       month = '' + (d.getMonth() + 1),
//       day = '' + d.getDate(),
//       year = d.getFullYear();

//   if (month.length < 2) month = '0' + month;
//   if (day.length < 2) day = '0' + day;

//   return [year, month, day].join('-');
// }

function formatDate(date, type) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  if (type === 'mysql') {
    return [year, month, day].join('-');
  } else {
    return [day, month, year].join('-');
  } 
}

function getStudentGender(rows, studentGender){
  if(studentGender === 'M'){
    gender = 'Male';
  } else {
    gender = 'Female';
  }
  return gender;
}

///
/// HTTP Method	: GET
/// Endpoint 	: /students
/// 
/// To get collection of student saved in MySQL database.
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
        var gender = getStudentGender(rows, rows[i].gender);
        var dateOfBirth = formatDate(rows[i].date_of_birth, 'normal');

        // Create an object to save current row's data
        var student = {
          'student_id':rows[i].student_id,
          'name':rows[i].name,
          'address':rows[i].address,
          'gender':gender,
          'date_of_birth':dateOfBirth
        }
        // Add object into array
        studentList.push(student);
    }

    // Render index.pug page using array 
    res.render('index', {title: 'Student List', data: studentList});
    }
  });
});

///
/// HTTP Method	: GET
/// Endpoint 	: /student/(:id)
/// 
/// Show edit form
///
app.get('/student/:id', function(req, res){
	con.query('SELECT * FROM tbl_student WHERE student_id = ?', [req.params.id], function(err, rows, fields) {
		if(err) throw err
		
		// if user not found
		if (rows.length <= 0) {
				res.redirect('/students')
		} else { 
      var studentDoB = formatDate(rows[0].date_of_birth, 'mysql');
      console.log(studentDoB);

			// if user found
			// render to views/index.pug template file
			res.render('student', {
				title: 'Edit Student', 
				sid: rows[0].student_id,
				sname: rows[0].name,
				saddress: rows[0].address,
				sgender: rows[0].gender,
				sdob: studentDoB,
				sOldId: rows[0].student_id
			})
		}            
	});
});

///
/// HTTP Method	: POST
/// Endpoint 	: /insert_update_student
/// 
/// To insert or update student data in MySQL database.
///
app.post('/insert_update_student', function(req, res) {
	var studentId = req.body.id;
	var studentName = req.body.name;
	var studentAddress = req.body.address;
	var studentGender = req.body.radio;
	var studentDoB = req.body.dob;
	var studentOldId = req.body.oldId;
	console.log(studentId+' '+studentName+' '+studentAddress+' '+studentGender+' '+studentDoB+' '+studentOldId);

	var postData  = {student_id: studentId, name: studentName, address: studentAddress, gender: studentGender, date_of_birth: studentDoB};

	if(studentOldId !== undefined && studentOldId !== '') {
		con.query('UPDATE tbl_student SET student_id = ?, name = ?, address = ?, gender = ?, date_of_birth = ? WHERE student_id = ?', [studentId, studentName, studentAddress, studentGender, studentDoB, studentOldId], function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
		});
	} else {
		con.query('INSERT INTO tbl_student SET ?', postData, function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
		});
	}
});

app.get('/fstudent', function(req, res) {
  // Render index.pug page using array 
  res.render('student', {title: 'Student'});
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
