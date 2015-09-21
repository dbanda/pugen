var express = require('express');
var router = express.Router(); 
var mongoose = require('mongoose');
var db = mongoose.connection;
var models = require('./models');
var createKeys = require('rsa-json');
var bcrypt = require('bcrypt');
var gen = require('./gen')
var openpgp = require('openpgp');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
	if (req.session.user){

		user =req.session.user;
		var salt = user.salt;

		var phrase = req.body.phrase;
        var keyword = req.body.keyword;
        var site = req.body.site;
        var length = 8;
        
        var words = keyword.split();
        
        var data = phrase+keyword+site+length;
        bcrypt.hash(data, 8, function(err, hash) {
        	if(err){
        		console.error(err);
        		res.json(JSON.stringify(err));
        		return
        	}
        	gen(req,function(pword) {
        		console.log("your new pword: "+ pword);
        		req.session.pword = pword;
        		res.json(pword);
        	});
    	});
	}
  //res.render('index', { title: 'Express' });
});

router.post('/accept' , function(req,res,next){
	//console.log(JSON.stringify(req.session.user));
	//console.log(JSON.stringify(req.session.user.public_key));

	var key = req.session.user.public_key.toString();
	var publicKey = openpgp.key.readArmored(key);
	//console.log(JSON.stringify(publicKey));

	openpgp.encryptMessage(publicKey.keys, req.session.pword).then(function(pgpMessage) {
	    // success
        var newPword = new models.Pwords({userid: user.id, 
        								salted_hash: "hash", 
        								time: Date.now(),
        								encrypted_password: pgpMessage})
		
		newPword.save(function(err, user){
			res.json(req.session.pword);

		})
	}).catch(function(error) {
	    // failure
	    console.error(error);
	});
})
module.exports = router;
