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

    var data = new FormData();
    data.append("username", musername);
    data.append("password", mpassword);

    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });
    xhr.open("POST", moodleURL);
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.send(data);

    xhr.onload = function() {
        console.log(this.responseText);
        if (this.responseText.includes("You are not logged in")) {
            next(new Error('[[error:invalid-username-or-password]]'));
        } else {
            next(null, {
                uid: musername
            }, '[[success:authentication-successful]]');
        }
    }


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
