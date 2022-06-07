const Sport = require('../models/sport');
const Brand = require('../models/brand');
const Product = require('../models/product');
const async = require('async');
const { body,validationResult } = require('express-validator');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

//Upload image to S3
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { uploadFile, deleteFile } = require("../s3");

exports.product_list = async (req, res) => {
  try {
    const products = await Product.find();
    res.render('product_list', { title: 'All Products', product_list: products});
  } catch (err) {
    return res.status(404).send({ error: err.message })
  }
}

//Get specific product detail page
exports.product_detail = async (req, res, next) => {
  async.parallel(
    {
      product: function(callback) {
        Product.findById(req.params.id).populate('brand').exec(callback)
      },
    }, function(err, results) {
      if (err) { return next(err); } // Error in API usage.
      if (results.product==null) { // No results.
          var err = new Error('Product not found');
          err.status = 404;
          return next(err);
      }
      // Successful, so render.
      res.render('product_detail', { title: 'Product Details', product: results.product } );
  });
}

//GET request - create new product form
exports.create_product_get = async (req, res, next) => {

  async.parallel(
    {
      brands: function(callback){
        Brand.find(callback)
      },
      sports: function(callback){
        Sport.find(callback)
      },
  }, (err, results) => {
    if (err) { return next(err); }
    res.render('product_form', { title: "Create a new product", sports: results.sports, brands: results.brands })
  })
}

//POST request - create new product
exports.create_product_post = [
  //upload image to Multer
  upload.single('image'),

  //Middleware to validate and sanitize fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1}).escape(),
  body('description').trim().optional({ checkFalsy: true }).escape(),
  body('product_code').trim().optional({ checkFalsy: true }).isLength({ min:8, max:8 }).escape(),
  body('price', 'Price must be a positive whole number').trim().isLength({ min: 1, max: 7}).isFloat({min: 1, max: 9999}).escape(),
  body('stock').trim().isLength({ min: 1, max: 3}).withMessage('Must be at least 1 item, but no more than 999').isFloat().withMessage('Must be at least a number').escape(),
  body('brand', 'Brand must not be empty').trim().isLength({ min: 1}).escape(),
  body('sport', 'Sport must not be empty').trim().isLength({ min: 1}).escape(),

  //Use validated/sanitized data
  async (req, res, next) => {
    const errors = validationResult(req);

    //image upload to S3
    const result = await uploadFile(req.file);
    //Remove locally stored image
    await unlinkFile(req.file.path);


    // if there are errors, rerender the form
    if (!errors.isEmpty()) {
      async.parallel(
        {
        brands: function(callback){
          Brand.find(callback)
        },
        sports: function(callback){
          Sport.find(callback)
        },
       }, (err, results) => {
          if (err) { return next(err); }

          //Reset the form with the sport that was selected
          for (let i = 0; i < results.sports.length; i++) {
              if (product.sport === (results.sports[i]._id)) {
                  results.sports[i].selected='selected';
              }
          }
          //Reset the form with the brand that was selected
          for (let i = 0; i < results.brands.length; i++) {
            if (product.brand === (results.brands[i]._id)) {
                results.brands[i].selected='selected';
            }
        }
          res.render('product_form', { title: "Create a new product", sports: results.sports, brands: results.brands, product: product, errors: errors.array() })
        });
      return;
    } else {
      //No error, send product to DB
      //create product obj
      const product = new Product(
        { name: req.body.name,
          description: req.body.description,
          product_code: req.body.product_code,
          price: req.body.price,
          stock: req.body.stock,
          brand: req.body.brand,
          sport: req.body.sport,
          image: result.Location,
        });
      
      // Check if product already exists in DB. Redirect to it if it exists. Same product from new brand is ok.
      Product.findOne({ 'name': req.body.name, 'brand': req.body.brand })
      .exec( function(err, product_search) {
      if (err) { return next(err); }
        if (product_search) {
          res.redirect(product_search.url);
          } else {

            //Not a duplicate, so save to DB and then show product page
            product.save(function (err) {
              if (err) { return next(err); }
                res.redirect(product.url);
              });
        }
      });
    }
  }
];


exports.product_delete_get = async (req, res, next) => {
  async.parallel(
    {
      product: function(callback) {
        Product.findById(req.params.id).exec(callback)
      },
    }, (err, results) => {
      if (err) { return next(err) }
      //Product not found. Redirect to list of brands
      if (results.product === null) {
        res.redirect('/shop/brands')
      }
      //Product found. Render page to delete product
      console.log('results.product.brand: ', results.product.brand)
      res.render('product_delete', { title:'Delete product: ', product: results.product })
    }
  )
}


exports.product_delete_post = async (req, res, next) => {
  async.parallel(
    {
      product: function(callback) {
        Product.findById(req.body.productID).exec(callback)
      }
    }, (err, results) => {
      if (err) { return next(err) }
      
      //Product exists, now delete product
      Product.findByIdAndRemove(req.body.productID, (err) => {
        if (err) { return next(err) }
        res.redirect(`/shop/brands/${results.product.brand}`)
      })
    }
  )
}