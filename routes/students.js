const express = require('express');
const router = express.Router();
const connection = require('../connection');
const moment = require('moment');

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

/* GET tampilkan form data student */
router.get('/add', function(req, res, next) {
  // Render index.pug page using array 
  res.render('form_student', {title: 'Add Student'});
});

router.post('/add_update', function(req, res) {
	var studentId = req.body.student_id;
	var studentName = req.body.name;
	var studentAddress = req.body.address;
	var studentGender = req.body.gender;
	var studentDoB = req.body.date_of_birth;
	var studentOldId = req.body.old_id;

  var postData  = {
    student_id: studentId, 
    name: studentName, 
    address: studentAddress, 
    gender: studentGender, 
    date_of_birth: studentDoB};

	if(studentOldId !== undefined && studentOldId !== '') {
    connection.query('UPDATE tbl_student SET student_id = ?, name = ?, address = ?, gender = ?, date_of_birth = ? WHERE student_id = ?', 
    [studentId, studentName, studentAddress, studentGender, studentDoB, studentOldId], 
    function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
		});
	} else {
		connection.query('INSERT INTO tbl_student SET ?', postData, function (error, results, fields) {
			if (error) throw error;
			res.redirect('/students');
		});
	}
});

router.get('/:id', function(req, res){
  connection.query('SELECT * FROM tbl_student WHERE student_id = ?', 
  [req.params.id], function(err, rows, fields) {
		if(err) throw err
		
		// if user not found
		if (rows.length <= 0) {
				res.redirect('/students')
		} else { 
      var studentDoB = moment(rows[0].date_of_birth).format('YYYY-MM-DD');

			// if user found
			// render to views/index.pug template file
			res.render('form_student', {
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

router.post('/delete/:id', function (req, res) {
  connection.query('DELETE FROM tbl_student WHERE student_id = ?', [req.params.id], function(err, result) {
    if(err) throw err
    res.redirect('/students');
  });
});

module.exports = router;