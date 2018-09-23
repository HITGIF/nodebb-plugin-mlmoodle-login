"use strict";

let moodleURL = 'http://moodle.mapleleafzhenjiang.com/login/index.php'
let loginPhrase = 'You are not logged in'
var	passport = module.parent.require('passport'),
passportLocal = module.parent.require('passport-local').Strategy,
plugin = {};

plugin.login = function() {
    passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
};

plugin.continueLogin = function(req, musername, mpassword, next) {

    if (username = 'test') {
        user.getUidByUsername(musername, function(err, uid) {
            if (uid == null) {
                user.create({
                    username: 'test',
                    password: 'test'
                });
            }
        });
        next(null, {
            uid: 8
        }, '[[success:authentication-successful]]');
    }

    var request = require('request');
    request.post(
        moodleURL,
        { formData: { username: musername, password: mpassword } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
            if (body.includes(loginPhrase)) {
                next(new Error('[[error:invalid-username-or-password]]'));
            } else {
                var user = module.parent.require('./user');

                user.getUidByUsername(musername, function(err, uid) {
                    if (uid == null) {
                        user.create({
                            username: musername,
                            password: mpassword
                        });
                    }
                });
                user.getUidByUsername(musername, function(err, muid) {
                    if (muid != null ) {
                        next(null, {
                            uid: muid
                        }, '[[success:authentication-successful]]');
                    } else {
                        next(new Error('[[error:invalid-username-or-password]]'));
                    }
                });
            }
        }
    );
};

module.exports = plugin;
