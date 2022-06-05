const Product = require('../models/product');
const Sport = require('../models/sport');
const Brand = require('../models/brand');
var async = require('async');
const { body, validationResult } = require('express-validator');


//Get all Brands
exports.brand_list = async (req, res) => {
  try {
    const brands = await Brand.find()
    // if (!brands) return "No brands in store currently." 
    res.render('brand_list', { title: 'All Brands', brand_list: brands })
  } catch (err) {
    console.log(err)
    return res.status(404).send({ error: err.message })
  }
}

//Get specific brand page
exports.brand_page = async (req, res, next) => {
  async.parallel(
    {
      brand: function(callback) {
        Brand.findById(req.params.id).exec(callback)
      },
      brand_products: function(callback) {
        Product.find({ 'brand': req.params.id }, 'name description price').exec(callback)
      },
    }, function(err, results) {
      if (err) { return next(err); } // Error in API usage.
      if (results.brand==null) { // No results.
          var err = new Error('Brand not found');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      res.render('brand_page', { title: 'Brand Detail', brand: results.brand, brand_products: results.brand_products } );
  });
}

//GET request - create new brand
exports.create_brand_get = async (req, res, next) => {
  res.render('brand_form', { title: "Create a new brand"})
}

//POST request - create new brand
exports.create_brand_post = [
  //Middleware to validate and sanitize fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1}).escape(),
  body('description', 'Description must not be empty').trim().isLength({ min: 1}).escape(),
  body('date_created').trim().optional({ checkFalsy: true }).escape(),

  //Use validated/sanitized data
  (req, res, next) => {
    const errors = validationResult(req);

    // if there are errors, rerender the form
    if (!errors.isEmpty()) {
      res.render('brand_form', { title: "Create a new brand", brand: req.body, errors: errors.array() });
      return;
    } else {
      //No error, send brand to DB
      //create brand obj
      const brand = new Brand(
        { name: req.body.name,
          description: req.body.description,
          date_created: req.body.date_created
        });
      
      // Check if brand already exists. Redirect to it if it exists.
      Brand.findOne({ 'name': req.body.name })
      .exec( function(err, brand_search) {
      if (err) { return next(err); }
        if (brand_search) {
          res.redirect(brand_search.url);
          } else {

            //Not a duplicate, so save to DB and then show brand page
            brand.save(function (err) {
              if (err) { return next(err); }
                res.redirect(brand.url);
              });
        }
      });
    }
  }
];


exports.brand_delete_get = async (req, res, next) => {
  async.parallel(
    {
      brand: function(callback) {
        Brand.findById(req.params.id).exec(callback)
      },
      brand_products: function(callback) {
        Product.find({ 'brand': req.params.id }).exec(callback)
      }
    }, (err, results) => {
      if (err) { return next(err) }
      //Brand not found. Redirect to list of brands
      if (results.brand === null) {
        res.redirect('/shop/brands')
      }
      //Brand found. Render page to delete brand
      res.render('brand_delete', { title:'Delete brand: ', brand: results.brand, products: results.brand_products })
    }
  )
}

exports.brand_delete_post = async (req, res, next) => {
  async.parallel(
    {
      brand: function(callback) {
        Brand.findById(req.body.brandID).exec(callback)
      },
      brand_products: function(callback) {
        Product.find({ 'brand': req.body.brandID }).exec(callback)
      }
    }, (err, results) => {
      if (err) { return next(err) }
      //If brand has products, direct to brand page. Don't delete brand.
      if (results.brand_products.length > 0) {
        res.render('brand_delete', { title:'Delete brand: ', brand: results.brand, products: results.brand_products })
      }
      //Otherwise delete brand
      Brand.findByIdAndRemove(req.body.brandID, (err) => {
        if (err) { return next(err) }
        res.redirect('/shop/brands')
      })
    }
  )
}