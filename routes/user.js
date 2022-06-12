const express = require('express');
const router = express.Router();

//User controller
const userController = require('../controllers/userController');
var csrf = require('csurf')
var csrfProtection = csrf();
router.use(csrfProtection)


//Log in middleware
const isLoggedIn =  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
};

const notLoggedIn =  (req, res, next) => {
    if (!req.isAuthenticated()) return next();
    res.redirect('/');
}


// Route to userController sign up form. 
router.get('/sign-up', notLoggedIn, userController.signup_get);
router.post('/sign-up', userController.signup_post);

// Route to userController sign in form
router.get('/sign-in', notLoggedIn, userController.signin_get);
router.post('/sign-in', userController.signin_post);

//Log out user
router.get('/logout', userController.logout);

module.exports = router;

