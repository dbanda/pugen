var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = mongoose.connection;
var models = require('./models');
// var createKeys = require('rsa-json');
var bcrypt = require('bcrypt');
var gen = require('./gen')
var gen_domain = require('./gen-domain')
var openpgp = require('openpgp');
var fs = require('fs');
var https = require('https')

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/fblogin', function(req, ret, next) {

    https.get("https://graph.facebook.com/v2.3/oauth/access_token?client_id=814216818699536&redirect_uri=http://localhost:3000/fblogin&client_secret=37f2fcfafed8cc314744068ac148bc78&code=" + req.query.code, function(res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function(d) {
            access_token = JSON.parse(d.toString());
            https.get("https://graph.facebook.com/me?fields=public_key&access_token=" + access_token.access_token, function(res) {
                console.log("Got response: " + res);
                var body
                res.on('data', function(d) {
                    body += d
                });

                res.on('end', function(d) {
                    body = body.toString();
                    ret.json(body)
                });

            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });

});

router.get('/retrieve', function(req, res, next) {
    if (req.session.user) {
        var user = req.session.user;
        var response = "";

        models.Pwords.find({
            'userid': user.id
        }, function(err, pwords) {
            pwords.forEach(function(pword) {
                response = response + pword.site + '\n' + pword.encrypted_password + '\n\n';
            })

            fs.writeFile("passwords.txt", response, function(err) {
                console.log("writing passwords to file:  ");
                if (err) {
                    console.log(err)
                }
                res.download("passwords.txt");
            })

        })
    } else {
        res.json('user not logged in');
    }
})

/* GET home page. */
router.get('/domain', function(req, res, next) {
    res.render('domain', {
        title: 'Express'
    });
});

router.post('/domain', function function_name(req, res, next) {
    // body...
    req.body.keyword = "";
    req.body.site = "";
    if (req.body.phrase == "") {
        res.json("phrase is empty!")
        return
    }

    gen_domain(req, function(pword) {
        console.log("your new pword: " + pword);
        res.json(pword);
    });
})

router.post('/', function(req, res, next) {
    if (req.session.user) {

        var user = req.session.user;
        var salt = user.salt;

        var phrase = req.body.phrase;
        var keyword = req.body.keyword;
        var site = req.body.site;
        var length = 8;


        console.log("calling generator");

        gen(req, function(pword) {
            console.log("your new pword: " + pword);

            req.session.data = {
                phrase: phrase,
                keyword: keyword,
                site: site,
                password_length: length,
                password: pword,
                time: Date.now(),
                user: user.id
            }
            res.json(pword);
        });
    } else {
        res.json('user not logged in');
    }
});

router.post('/accept', function(req, res, next) {
    //console.log(JSON.stringify(req.session.user));
    //console.log(JSON.stringify(req.session.user.public_key));
    if (req.session.user.public_key && req.session.data) {
        var key = req.session.user.public_key.toString();
        var publicKey = openpgp.key.readArmored(key);
        var user = req.session.user;
        //console.log(JSON.stringify(publicKey));
        var msg = JSON.stringify(req.session.data)
        openpgp.encryptMessage(publicKey.keys, msg).then(function(pgpMessage) {
            // success
            var newPword = new models.Pwords({
                userid: user.id,
                phrase: req.session.data.phrase,
                site: req.session.data.site,
                time: Date.now(),
                encrypted_password: pgpMessage
            })

            newPword.save(function(err, user) {
                console.log('encyption complete');
                res.json(req.session.data.password);

            })
        }).catch(function(error) {
            // failure
            console.error(error);
        });
    } else {
        res.render('index', {
            title: 'Express'
        });
    }

})
module.exports = router;
