var express = require('express');
const cart = require('../models/cart');
var router = express.Router();

const Product = require('../models/product');
const Cart = require('../models/cart');

/* Redirect to /shop homepage. */
// router.get('/', function(req, res, next) {
//   res.redirect('/shop');
// });

router.get('/addToCart/:id', (req, res, next) => {
  const productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(productId, (err, product) => {
    if (err) return next(err);
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/shop/products/' + productId)
  })
})


module.exports = router;
