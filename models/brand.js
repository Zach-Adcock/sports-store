const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const BrandSchema = new Schema(
  {
    name: { type: String, required: true},
    // logo: { type: ?, required: false},
    description: { type: String, required: true},
    year_created: { type: String, required: false},
    image: {type: String, required: true},
  }
)

//Virtual for Brand URL
BrandSchema.virtual('url').get(
  function () {
    return `/shop/brands/${this._id}`
  }
);

module.exports = mongoose.model('Brand', BrandSchema);