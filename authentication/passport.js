const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require("passport-local").Strategy;
const { body,validationResult } = require('express-validator');


passport.use('local.signup',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return done(null, false, req.flash('userInputError', errors.array()))
        }
        User.findOne({ 'email': email }, (err, user) => {
            if (err) return done(err);
            if (user) return done(null, false, { message: 'This email is in use' });
            const newUser = new User();
            newUser.email = email;
            newUser.password = newUser.encryptPassword(password);
            newUser.save( (err, res) => {
                if (err) return done(err);
                return done(null, newUser)  
            })
        })
    })
);

passport.use('local.signin',
    new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        User.findOne({ 'email': email }, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'This email name was not found.' });
            if (!user.validatePassword(password)) return done(null, false, { message: 'Incorrect password.' });
            return done(null, user);
        })
    }
));


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
  