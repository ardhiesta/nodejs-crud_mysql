var express = require('express');
var router = express.Router();

/* GET home page
redirect ke /students */
router.get('/', function(req, res, next) { 
  res.redirect('/students');
});

module.exports = router;
