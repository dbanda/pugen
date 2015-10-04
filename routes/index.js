var express = require('express');
var router = express.Router(); 
var mongoose = require('mongoose');
var db = mongoose.connection;
var models = require('./models');
var createKeys = require('rsa-json');
var bcrypt = require('bcrypt');
var gen = require('./gen')
var gen_domain = require('./gen-domain')
var openpgp = require('openpgp');
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/domain', function(req, res, next) {
  res.render('domain', { title: 'Express' });
});

router.post('/domain', function function_name (req, res,next) {
    // body...
    req.body.keyword = "";
    req.body.site = "";

    gen_domain(req,function(pword) {
            console.log("your new pword: "+ pword);
            res.json(pword);
        });
})

router.post('/', function(req, res, next) {
	if (req.session.user){

		user =req.session.user;
		var salt = user.salt;

		var phrase = req.body.phrase;
        var keyword = req.body.keyword;
        var site = req.body.site;
        var length = 8;
        

        console.log("calling generator");

    	gen(req,function(pword) {
    		console.log("your new pword: "+ pword);
    		
            req.session.data = {
                phrase: phrase,
                keyword: keyword,
                site: site,
                password_length: length,
                password: pword,
                time: Date.now(),
                user: JSON.stringify(user)
            }
    		res.json(pword);
    	});
	}else{
    res.json('user not logged in');
        
    }
});

router.post('/accept' , function(req,res,next){
	//console.log(JSON.stringify(req.session.user));
	//console.log(JSON.stringify(req.session.user.public_key));
    if (req.session.user.public_key && req.session.data){
        var key = req.session.user.public_key.toString();
        var publicKey = openpgp.key.readArmored(key);
        console.log(JSON.stringify(publicKey));
        var msg = JSON.stringify(req.session.data)
        openpgp.encryptMessage(publicKey.keys, msg).then(function(pgpMessage) {
            // success
            var newPword = new models.Pwords({userid: user.id, 
                                            phrase: req.session.phrase,
                                            site: req.session.site,
                                            time: Date.now(),
                                            encrypted_password: pgpMessage})
            
            newPword.save(function(err, user){
                console.log('encyption complete');
                res.json(req.session.data.password);

            })
        }).catch(function(error) {
            // failure
            console.error(error);
        });
    }else{
        res.render('index', { title: 'Express' });
    }

})
module.exports = router;
