const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create Product schema
const ProductSchema = new Schema({
  name: {type: String, required: true},
  brand: {type: Schema.Types.ObjectId, ref: 'Brand', required: true},
  description: {type: String, required: false},
  product_code: {type: String, required: false},
  sport: {type: Schema.Types.ObjectId, ref: 'Sport', required: true},
  price: {type: Number, required: true},
  stock: {type: Number, required: true},
  image: {type: String, required: true},
  adminLock: { type: Boolean, required: true, default: false}
});

//Virtual for Product's URL
ProductSchema.virtual('url').get(
  function () {
    return `/shop/products/${this._id}`
  }
);

module.exports = mongoose.model('Product', ProductSchema)
