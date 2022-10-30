var express = require('express');
var router = express.Router();
var viewCtrl = require('../controllers/ViewController');

/* GET home page. */
router.get('/:id', viewCtrl.get);

module.exports = router;
