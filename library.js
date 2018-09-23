"use strict";

let moodleURL = 'http://moodle.mapleleafzhenjiang.com/login/index.php'
var	passport = module.parent.require('passport'),
passportLocal = module.parent.require('passport-local').Strategy,
plugin = {};

plugin.login = function() {
    // winston.info('[login] Registering new local login strategy');
    passport.use(new passportLocal({passReqToCallback: true}, plugin.continueLogin));
};

plugin.continueLogin = function(req, musername, mpassword, next) {

    var request = require('request');

    request.post(
        moodleURL,
        { formData: { username: musername, password: mpassword } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
            if (body.includes("You are not logged in")) {
                next(new Error('[[error:invalid-username-or-password]]'));
            } else {
                var user = module.parent.require('./user');
                console.log(user)

                user.getUidByUsername(musername, function(err, uid) {
                    if (uid == null) {
                        user.create({
                            username: musername,
                            password: mpassword,
                            email: '1@why_are_u_seeing_this.com'
                        });
                    }
                });
                user.getUidByUsername(musername, function(err, muid) {
                    if (muid != null ) {
                        next(null, {
                            uid: muid
                            isAdminOrGlobalMod: (musername == '19050069')
                        }, '[[success:authentication-successful]]');
                    } else {
                        next(new Error('[[error:invalid-username-or-password]]'));
                    }
                });

            }
        }
    );


    // But if the login was unsuccessful, pass an error back, like so:
    // next(new Error('[[error:invalid-username-or-password]]'));

    /*
    You'll probably want to add login in this method to determine whether a login
    refers to an existing user (in which case log in as above), or a new user, in
    which case you'd want to create the user by calling User.create. For your
    convenience, this is how you'd create a user:

    var user = module.parent.require('./user');

    user.create({
    username: 'someuser',
    email: 'someuser@example.com'
});

Acceptable values are: username, email, password
*/
};

module.exports = plugin;
