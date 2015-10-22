'use strict'
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var models = require('./models');
// var createKeys = require('rsa-json');
var bcrypt = require('bcrypt');
var multer = require('multer')
var upload = multer({
    dest: 'uploads/'
})

// router.use(upload.single('avatar'));

/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log("get users");
    res.send('respond with a resource');
});

router.get('/fblogin', function(req, ret, next) {

    https.get("https://graph.facebook.com/v2.3/oauth/access_token?client_id=814216818699536&redirect_uri=http://localhost:3000/fblogin&client_secret=37f2fcfafed8cc314744068ac148bc78&code=" + req.query.code, function(res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function(d) {
            access_token = JSON.parse(d.toString());
            https.get("https://graph.facebook.com/me?fields=id,public_key&access_token=" + access_token.access_token, function(res) {
                console.log("Got response: " + res);
                var body
                res.on('data', function(d) {
                    body += d
                });

                res.on('end', function(d) {
                    data = JSON.parse(body.toString());
                    ret.json(body)
                    var req = {
                        body: {
                            id: data.id,
                            public_key: data.public_key
                        }
                    }

                    login(req, ret)
                });

            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });

});

router.post('/login', upload.single('file'), function(req, res, next) {
    console.log("body: " + JSON.stringify(req.body));
    console.log("files: " + JSON.stringify(req.file));
    login(req, res)

});

function login(req, res) {
    // body...
    models.Users.findOne({
        'id': req.body.id
    }, function(err, user) {
        //console.log("searching" + req.body.id +err +user);
        if (user) {
            req.session.regenerate(function(err) {
                    // will have a new session here 
                    req.session.user = user;
                    console.log("regenerated session");
                    res.json("user logged in" + JSON.stringify(req.file) + JSON.stringify(req.files) + req)
                })
                // createKeys(function(err,pair){
                //  req.session.server_public_key = pair.public;
                //  req.session.server_private_key = pair.private;
                //  res.json(pair.public);
                // });

            return
        }
        if (err) {
            res.send("err " + err);
            return
        } else {
            if (req.body.id && req.body.public_key) {
                var newUser = new models.Users({
                    id: req.body.id,
                    public_key: req.body.public_key
                })
                newUser.save(function(err, user) {
                    req.session.regenerate(function(err) {
                        // will have a new session here 
                        req.session.user = user;
                        res.json(user.id + " saved and session created");
                    })
                })
            }
        }
    })
}
module.exports = router;
