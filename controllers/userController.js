var express = require('express');
var router = express.Router();
var async = require('async');
const { body,validationResult } = require('express-validator');
const passport = require('passport');

var User = require('../models/user');

/* Render user sign up form. */
exports.signup_get = async (req, res, next) => {
    const errMessages = req.flash('error');
    const userError = req.flash('userInputError');
    res.render('user/signup', {csrfToken: req.csrfToken(), title: 'Sign-up Form', validationErrors: errMessages, userInputError: userError})
}

/* Post user sign up submission. */
exports.signup_post = [[
    body('email', 'Invalid email').notEmpty().isEmail(),
    body('password', 'Invalid password. Must be at least 5 characters').notEmpty().isLength({ min: 5, max: 100 })
],
passport.authenticate('local.signup', {
    successRedirect: '/shop/brands',
    failureRedirect: '/user/sign-up',
    failureFlash: true
})]

/* Render user sign in form. */
exports.signin_get = async (req, res, next) => {
    const errMessages = req.flash('error');
    // const userError = req.flash('userInputError');
    res.render('user/signin', {csrfToken: req.csrfToken(), title: 'Sign-In Form', validationErrors: errMessages})
};


/* Post user sign in submission. */
exports.signin_post = passport.authenticate('local.signin', {
    successRedirect: '/shop/brands',
    failureRedirect: '/user/sign-in',
    failureFlash: true
});


exports.logout = async (req, res, next) => {
    req.logout( err => {
        if (err) { return next(err); }
    });
    res.redirect('/shop');

}
