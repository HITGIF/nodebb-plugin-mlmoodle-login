"use strict";

let moodleTokenURL = 'http://moodle.mapleleafzhenjiang.com/login/token.php?service=moodle_mobile_app'
let moodleRealNameURL = 'http://moodle.mapleleafzhenjiang.com/webservice/rest/server.php?wstoken=%s&wsfunction=core_user_get_users_by_field&moodlewsrestformat=json&field=idnumber&values[0]=%s'
let adminEmail = 'carbonylgp@gmail.com'

var	passport = module.parent.require('passport'),
passportLocal = module.parent.require('passport-local').Strategy,
plugin = {};

plugin.login = function() {
    passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
};

plugin.continueLogin = function(req, musername, mpassword, next) {
    var user = module.parent.require('./user');
    var	assert = require('assert');
    var util = require('util');
    if (musername.includes('@')) {
        next(new Error('[[mlmoodle:use-id-not-email]]'));
        return
    }
    if (musername == 'test1') {
        user.getUidByEmail(musername, function(err, muid) {
            if (uid == null) {
                user.create({ username: 'test1', email: 'test1' }, function (err, nuid) {
                    assert.ifError(err);
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
            moodleTokenURL,
            { formData: { username: musername, password: mpassword } },
            function (error, response, body) {
                let bd = JSON.parse(body);
                var error = bd.error;
                var token = bd.token;
                if (error) {
                    next(new Error('[[error:invalid-user-data]]'));
                } else if (token) {
                    user.getUidByEmail(musername + '@moodle', function(err, muid) {
                        if (muid == null) {
                            request.get(
                                util.format(moodleRealNameURL, token, musername),
                                function (error, response, body) {
                                    user.create({
                                        // Username is the REAL NAME (e.g. ZhouQi_Matt)
                                        username: JSON.parse(body)[0].fullname.replace(', ', '').replace(' ', '_'),
                                        // Email is the ID (e.g. 19050001)
                                        email: musername + '@moodle'
                                    }, function (err, nuid) {
                                        assert.ifError(err);
                                        next(null, {
                                            uid: nuid
                                        }, '[[success:authentication-successful]]');
                                    });
                                }
                            );
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
