"use strict";

let moodleURL = 'http://moodle.mapleleafzhenjiang.com/login/token.php?service=moodle_mobile_app'
let loginPhrase = 'token'
let logoutPhrase = 'Invalid login'
let adminEmail = 'carbonylgp@gmail.com'

var	passport = module.parent.require('passport'),
passportLocal = module.parent.require('passport-local').Strategy,
plugin = {};

plugin.login = function() {
    passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
};

plugin.continueLogin = function(req, musername, mpassword, next) {
    var user = module.parent.require('./user');
    if (musername == 'test1') {
        user.getUidByUsername(musername, function(err, muid) {
            if (uid == null) {
                user.create({
                    username: 'test1'
                }, function (nuid) {
                    next(null, {
                        uid: nuid
                    }, '[[success:authentication-successful]]');
                });
            } else {
                next(null, {
                    uid: muid
                }, '[[success:authentication-successful]]');
            }
        });
    } else {
        var request = require('request');
        request.post(
            moodleURL,
            { formData: { username: musername, password: mpassword } },
            function (error, response, body) {
                console.log(body)
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
                if (body.includes(logoutPhrase)) {
                    next(new Error('[[error:invalid-user-data]]'));
                } else if (body.includes(loginPhrase)) {
                    user.getUidByUsername(musername, function(err, muid) {
                        if (muid == null) {
                            user.create({
                                username: musername
                            }, function (nuid) {
                                console.log("[][]"+nuid)
                                next(null, {
                                    uid: nuid
                                }, '[[success:authentication-successful]]');
                            });
                        } else {
                            next(null, {
                                uid: muid
                            }, '[[success:authentication-successful]]');
                        }
                    });
                } else {
                    next(new Error('Cannot access moodle. Please contact admin at ' + adminEmail + '.'));
                }
            }
        );
    }
};

module.exports = plugin;
