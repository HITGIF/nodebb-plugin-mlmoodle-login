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
    var user = module.parent.require('./user');
    if (musername == 'test1') {

            console.log('[][][0]');
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
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
                if (body.includes(loginPhrase)) {
                    console.log('[][][1]');
                    next(new Error('[[error:invalid-user-data]]'));
                } else {
                    user.getUidByUsername(musername, function(err, muid) {

                            console.log('[][][2]');
                        if (muid == null) {
                            user.create({
                                username: musername
                            }, function (nuid) {
                                next(null, {
                                    console.log('[][][3]');
                                    uid: nuid
                                }, '[[success:authentication-successful]]');
                            });
                        } else {
                            next(null, {
                                console.log('[][][4]');
                                uid: muid
                            }, '[[success:authentication-successful]]');
                        }
                    });
                }
            }
        );
    }
};

module.exports = plugin;
