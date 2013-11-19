/**
 * Handle user api invoke.
 *
 * @author tim.tang
 *
 * TODO:
 * - defence check request params.
 * - how to build error response?
 */

var constants = require('../common/constants'),
    _ = require('underscore'),
    sanitize = require('validator').sanitize,
    check = require('validator').check,
    hsHelper = require('../common/hearthstoneHelper'),
    config = require('../conf/hearthstone-conf').config,
    userService = require('../service').UserService;

var UserHandler = function UserHandler() {};


_.extend(UserHandler.prototype, {

    health: function(req, res) {
        res.send('I am alive!');
    },

    authenticate: function(req, res, next) {
        var cookie = req.cookies[config.auth_cookie_name];
        var auth_token = hsHelper.decrypt(cookie, config.session_secret);
        var auth = auth_token.split('\t');
        var userId = auth[0];
        userService.getUserById(userId, function(err, user) {
            if (err) {
                return next(err);
            }
            if (user) {
                req.session.user = user;
                return next();
            }
        });
    },

    signup: function(req, res, next) {
        var name = sanitize(req.body.name).trim();
        try {
            check(name, 'User name must be 0-9,a-z,A-Z').isAlphanumeric();
        } catch (e) {
            res.send({
                error: e.message,
                name: name,
                email: email
            });
            return;
        }

        //check email exists or not.
        userService.getUserByName(name, function(err, user) {
            if (err) {
                return next(err);
            }
            if (user) {
                res.send({
                    error: 'User Name has been used',
                    name: name,
                    email: email
                });
                return;
            }
        });

        var email = sanitize(req.body.email).trim();
        email = email.toLowerCase();
        try {
            check(email, 'Invalid email address').isEmail();
        } catch (e) {
            res.send({
                error: e.message,
                name: name,
                email: email
            });
            return;
        }


        var pass = sanitize(req.body.pass).trim();
        if (name === '' || pass === '' || email === '') {
            res.send({
                error: 'Lack user info.',
                name: name,
                email: email
            });
            return;
        }

        pass = hsHelper.md5(pass);
        // generate avatar url
        var avatar = 'http://www.gravatar.com/avatar/' + hsHelper.md5(email.toLowerCase()) + '?size=48';

        var deviceToken = sanitize(req.body.deviceToken).trim();
        userService.save(name, pass, email, avatar, deviceToken, function(err) {
            if (err) {
                return next(err);
            }
            res.send({
                success: true,
                msg: 'Signup sucess!'
            });
        });
    },

    login: function(req, res, next) {
        var name = sanitize(req.body.name).trim();
        var pass = sanitize(req.body.pass).trim();
        if (_.isEmpty(name) || _.isEmpty(pass)) {
            return res.send({
                error: 'Invalid username or password!',
                name: name,
                pass: pass
            });
        }

        userService.getUserByName(name, function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.send({
                    error: 'User not exists',
                    name: name,
                    pass: pass
                });
            }
            pass = hsHelper.md5(pass);
            if (!_.isEqual(pass, user.pass)) {
                return res.send({
                    error: 'Bad password!'
                });
            }
            hsHelper.popSession(user, res);
            res.send(user);
        });
    },

    logout: function(req, res, next) {
        req.session.destroy();
        hsHelper.clearCookie(res);
        res.send({
            success: true,
            msg: 'Logout sucess!'
        });
    },

    //TODO: check session existence.
    showinfo: function(req, res, next) {
        var name = req.params['name'];
        name = sanitize(name).trim();
        console.log("###### %s", req.cookies.token);
        userService.getUserByName(name, function(err, user) {
            if (err) {
                return next(err);
            }
            res.send(user);
        });
    }
});

var userHandler = new UserHandler();
module.exports = userHandler;
