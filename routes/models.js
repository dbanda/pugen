'use strict'

function Setup() {
    var mongoose = require('mongoose');
    var userSchema = new mongoose.Schema({
        id: String,
        public_key: String
    });

    var pwordSchema = new mongoose.Schema({
        userid: String,
        phrase: String,
        time: Date,
        site: String,
        encrypted_password: String
    })


    var Users = mongoose.model('User', userSchema);
    var Pwords = mongoose.model('Pword', pwordSchema);

    var models = {
        Users: Users,
        Pwords: Pwords
    };
    return models;
}

module.exports = Setup();