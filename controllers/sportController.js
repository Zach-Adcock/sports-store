const Product = require('../models/product');
const Sport = require('../models/sport');
var async = require('async');
const { body,validationResult } = require('express-validator');

const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

//Upload image to S3
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { uploadFile, deleteFile } = require("../s3");

exports.sport_list = async (req, res) => {
  try {
    const sports = await Sport.find();
    res.render('sport_list', { title: 'Search by Sport', sport_list: sports })
  } catch (err) {
    return res.status(404).send({ error: err.message });
  }
}

//Get specific sport page
exports.sport_page = async (req, res, next) => {
  async.parallel(
    {
      sport: function(callback) {
        Sport.findById(req.params.id).exec(callback)
      },
      sport_products: function(callback) {
        Product.find({ 'sport': req.params.id }, 'name description price brand image adminLock').populate('brand').exec(callback)
      },
    }, function(err, results) {
      if (err) { return next(err); } // Error in API usage.
      if (results.sport==null) { // No results.
          var err = new Error('Sport not found');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      res.render('sport_page', { title: 'Sport Detail', sport: results.sport, sport_products: results.sport_products } );
  });
}

//Render form to create new sport
exports.create_sport_get = async (req, res, next) => {
  res.render('sport_form', { title: 'Add a new sport'})
}



//POST form when creating new sport
exports.create_sport_post = [
  //upload image to Multer
  upload.single('image'),

  //sanitize input
  body('name', 'Name must not be empty').trim().isLength({ min: 1, max: 30 }).escape(),

  //Use validated/sanitized data
  async (req, res, next) => {
    const errors = validationResult(req);

    //Use s3.js to upload image to AWS bucket
    const result = await uploadFile(req.file);
    //Remove locally stored image
    await unlinkFile(req.file.path)
    // if there are errors, rerender the form
    if (!errors.isEmpty()) {
      res.render('sport_form', { title: 'Add a new sport', errors: errors.array()});
      return;
    } else {
      console.log('req.body.lock: ', req.body.lock)
      const locked = (req.body.lock === 'on' ? true : false) 
      console.log('locked: ', locked)
      const sport = new Sport({ 
          name: req.body.name,
          image: result.Location,
          adminLock: locked
      });

      //Check DB to see if sport already exists
      Sport.findOne({ 'name': req.body.name }).exec( (err, sport_search) => {
      //Redirect to sport page if it exists
      if (sport_search) {
        res.redirect(sport_search.url)
      } else {
        console.log('saving sport cuz it is new')
        //Add sport to DB if it doesn't exist
        sport.save( (err) => {
          if (err) { return next(err); }
          res.redirect(sport.url)
        })
      }
    })
    }  
  }
];


exports.sport_delete_get = async (req, res, next) => {
  console.log('req.params.id: ', req.params.id)
  async.parallel(
    {
      sport: function(callback) {
        Sport.findById(req.params.id).exec(callback);
      },
      sport_products: function(callback) {
        Product.find({ 'sport': req.params.id }).exec(callback);
      }
    }, (err, results) => {
      if (err) {return next(err)}
      if (results.sport === null) {
        res.redirect('/shop/sports')
      };
      //If sport exists and no errors, render delete page for sport
      console.log('sport: ', results.sport)
      res.render('sport_delete', {title: 'Delete sport: ', sport: results.sport, products: results.sport_products})
    }

    )
};


exports.sport_delete_post = async (req, res, next) => {
  async.parallel(
    {
      sport: function(callback) {
        Sport.findById(req.body.sportID).exec(callback);
      },
      sport_products: function(callback) {
        Product.find({ 'sport': req.body.sportID }).exec(callback);
      }
    }, (err, results) => {
      if (err) { return next(err) };
      if (results.sport_products.length > 0) {
        //There are products for this sport. Re-render sport's delete page.
        res.render('sport_delete', {title: 'Delete sport: ', sport: results.sport, products: results.sport_products})
      } else if (results.sport.adminLock) {
        //This sport is a default Admin created sport. Cannot delete
        // req.flash('info', 'Sorry, this sport was created by thine majesty. Deletion is impossible')
        res.render('sport_page', {title: 'Sport Detail', sport: results.sport, sport_products: results.sport_products, fail_message: `Can't delete this sport.`})
      } else {
        Sport.findByIdAndRemove(req.body.sportID, (err) => {
          if (err) { return next(err); }
          res.redirect('/shop/sports')
        })
      }
    }
  )
}
