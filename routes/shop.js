const express = require('express');
const router = express.Router();

//Import Controllers
const brandController = require('../controllers/brandController');
const productController = require('../controllers/productController');
const sportController = require('../controllers/sportController');
const sport = require('../models/sport');

/////////////////Shop Routes

////////Brand Routes
// GET shop home page.
router.get('/', brandController.brand_list);
router.get('/brands', brandController.brand_list);
//GET request - Display form to create new brand page
router.get('/brand/create', brandController.create_brand_get);
//POST request - create new brand 
router.post('/brand/create', brandController.create_brand_post);
//GET request - confirm brand to be deleted
router.get('/brand/:id/delete', brandController.brand_delete_get);
//POST request - delete brand
router.post('/brand/:id/delete', brandController.brand_delete_post);
//GET individual brand page
router.get('/brand/:id', brandController.brand_page);


///////Product Routes

//GET show all products
router.get('/products', productController.product_list); 
//GET request - Display form to create new product page
router.get('/product/create', productController.create_product_get);
//POST request - create new product 
router.post('/product/create', productController.create_product_post);
//GET request - confirm product to be deleted
router.get('/product/:id/delete', productController.product_delete_get);
//POST request - delete product
router.post('/product/:id/delete', productController.product_delete_post);
//GEt individual product page
router.get('/product/:id', productController.product_detail);


////////Sport Routes

//GET show all sports
router.get('/sports', sportController.sport_list); 
//GET request - display form for new sport
router.get('/sport/create', sportController.create_sport_get)
//POST request - create new sport
router.post('/sport/create', sportController.create_sport_post)
//GET request - confirm sport to be deleted
router.get('/sport/:id/delete', sportController.sport_delete_get);
//POST request - delete sport
router.post('/sport/:id/delete', sportController.sport_delete_post);
//GEt individual sport page
router.get('/sport/:id', sportController.sport_page);

module.exports = router;
