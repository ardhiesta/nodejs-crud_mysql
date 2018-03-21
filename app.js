const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');
const students = require('./routes/students_api');

const app = express();
const axios = require("axios");
const connection = require('./connection');
app.locals.moment = require('moment');
const moment = require('moment');

const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/api/students', students);

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
  axios.get(config.server.host+'/api/students')
  .then(function (response) {
    console.log(response.data);
    res.render('index', {title: 'Student List', data: response.data});
  })
  .catch(function (error) {
    console.log(error);
  });
});

///
/// HTTP Method	: GET
/// Endpoint 	: /student/(:id)
/// 
/// Show edit form
///
app.get('/student/:id', function(req, res){
	connection.query('SELECT * FROM tbl_student WHERE student_id = ?', [req.params.id], function(err, rows, fields) {
		if(err) throw err
		
		// if user not found
		if (rows.length <= 0) {
				res.redirect('/students')
		} else { 
      var studentDoB = moment(rows[0].date_of_birth).format('YYYY-MM-DD');
      // console.log(studentDoB);

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

app.post('/delete_student/:id', function (req, res) {
  connection.query('DELETE FROM tbl_student WHERE student_id = ?', [req.params.id], function(err, result) {
    if(err) throw err
    res.redirect('/students');
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
	// console.log(studentId+' '+studentName+' '+studentAddress+' '+studentGender+' '+studentDoB+' '+studentOldId);

	// var postData  = {student_id: studentId, name: studentName, address: studentAddress, gender: studentGender, date_of_birth: studentDoB};

	if(studentOldId !== undefined && studentOldId !== '') {
		connection.query('UPDATE tbl_student SET student_id = ?, name = ?, address = ?, gender = ?, date_of_birth = ? WHERE student_id = ?', [studentId, studentName, studentAddress, studentGender, studentDoB, studentOldId], function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
		});
	} else {
    // // TODO: masalah di sini
    // axios.post(config.server.host+'/api/students/add', {
    //   student_id: studentId, 
    //   name: studentName, 
    //   address: studentAddress, 
    //   gender: studentGender, 
    //   date_of_birth: studentDoB
    // })
    // .then(function (response) {
    //   console.log(response);
    //   res.redirect('/students');
    // })
    // .catch(function (error) {
    //   console.log(error);
    // });
		// connection.query('INSERT INTO tbl_student SET ?', postData, function (error, results, fields) {
		// 	if (error) throw error;
		// 	res.redirect('/students');
		// });
	}
});

app.get('/fstudent', function(req, res) {
  // Render index.pug page using array 
  res.render('student1', {title: 'Student'});
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
