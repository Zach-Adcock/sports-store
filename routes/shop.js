const express = require('express');
const router = express.Router();

//Import Controllers
const brandController = require('../controllers/brandController');
const productController = require('../controllers/productController');
const sportController = require('../controllers/sportController');

/////////////////Shop Routes

////////Brand Routes
// GET shop home page.
router.get('/', brandController.brand_list);
router.get('/brands', brandController.brand_list);
//GET request - Display form to create new brand page
router.get('/brands/create', brandController.create_brand_get);
//POST request - create new brand 
router.post('/brands/create', brandController.create_brand_post);
//GET request - confirm brand to be deleted
router.get('/brands/:id/delete', brandController.brand_delete_get);
//POST request - delete brand
router.post('/brands/:id/delete', brandController.brand_delete_post);
//GET individual brand page
router.get('/brands/:id', brandController.brand_page);


///////Product Routes

//GET show all products
router.get('/products', productController.product_list); 
//GET request - Display form to create new product page
router.get('/products/create', productController.create_product_get);
//POST request - create new product 
router.post('/products/create', productController.create_product_post);
//GET request - confirm product to be deleted
router.get('/products/:id/delete', productController.product_delete_get);
//POST request - delete product
router.post('/products/:id/delete', productController.product_delete_post);
//GEt individual product page
router.get('/products/:id', productController.product_detail);


////////Sport Routes

//GET show all sports
router.get('/sports', sportController.sport_list); 
//GET request - display form for new sport
router.get('/sports/create', sportController.create_sport_get)
//POST request - create new sport
router.post('/sports/create', sportController.create_sport_post)
//GET request - confirm sport to be deleted
router.get('/sports/:id/delete', sportController.sport_delete_get);
//POST request - delete sport
router.post('/sports/:id/delete', sportController.sport_delete_post);
//GEt individual sport page
router.get('/sports/:id', sportController.sport_page);

module.exports = router;
