'use strict'
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var models = require('./models');
// var createKeys = require('rsa-json');
var bcrypt = require('bcrypt');
var multer = require('multer');
var https = require('https');
var upload = multer({
    dest: 'uploads/'
})


// router.use(upload.single('avatar'));

/* GET users listing. */
router.get('/', function(req, res, next) {
    console.log("get users");
    res.send('respond with a resource');
});

router.get('/fblogin', function(request, ret, next) {

    https.get("https://graph.facebook.com/v2.3/oauth/access_token?client_id=814216818699536&redirect_uri=http://localhost:3000/users/fblogin&client_secret=37f2fcfafed8cc314744068ac148bc78&code=" + request.query.code, function(res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function(d) {
            var access_token = JSON.parse(d.toString());
            console.log("Got access_token " + d.toString());
            https.get("https://graph.facebook.com/me?fields=name,id,public_key&access_token=" + access_token.access_token, function(res) {
                console.log("Got response: " + res);
                var body = "";
                res.on('data', function(d) {
                    body += d
                });

                res.on('end', function(d) {
                    var data = JSON.parse(body.toString());
                    request.body.id = data.id;
                    request.body.public_key = data.public_key;
                    request.body.name = data.name;

                    login(request, ret);
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
    console.log("req" + req);
    models.Users.findOne({
        'id': req.body.id
    }, function(err, user) {
        //console.log("searching" + req.body.id +err +user);
        if (user) {
            req.session.regenerate(function(err) {
                    // will have a new session here 
                    req.session.user = user;
                    console.log("regenerated session");
                    res.json({
                        msg: "user logged in succesfuly",
                        id: user.id,
                        name: req.body.name,
                        session: true
                    });
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
                        res.json({
                            msg: "create user succesfuly",
                            id: user.id,
                            session: true,
                            created: true
                        });
                    })
                })
            } else {
                res.json({
                    msg: "failed to login",
                    session: false,
                    created: false
                });
            }
        }
    })
}
module.exports = router;
