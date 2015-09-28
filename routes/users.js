'use strict'
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var models = require('./models');
var createKeys = require('rsa-json');
var bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("get users");
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {

  models.Users.findOne({'id' : req.body.id},function(err, user){
  	//console.log("searching" + req.body.id +err +user);
  	if(user){
  		req.session.regenerate(function(err) {
  			// will have a new session here 
  			req.session.user = user;
  			console.log("regenerated session");
  			res.json("user logged in")
		})

		// createKeys(function(err,pair){
		// 	req.session.server_public_key = pair.public;
		// 	req.session.server_private_key = pair.private;
		// 	res.json(pair.public);
		// });
  		
  		return
  	}
  	if (err){
  		res.send("err " + err );
  		return
  	}else{
  			var newUser = new models.Users({id: req.body.id, public_key:req.body.public_key })
  	  	newUser.save(function(err, user){
  	  			req.session.regenerate(function(err) {
  					// will have a new session here 
  					req.session.user = user;
  					res.json(user.id + " saved and session created");
  				})
  		})

  	}
  })
});

module.exports = router;
