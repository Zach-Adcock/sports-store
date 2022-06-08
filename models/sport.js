const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SportSchema = new Schema(
  {
    name: { type: String, required: true},
    image: { type: String, required: true},
    adminLock: { type: Boolean, required: true, default: false}
  }
)


//Virtual for Sport URL
SportSchema.virtual('url').get(
  function () {
    return `/shop/sports/${this._id}`
  }
);

module.exports = mongoose.model('Sport', SportSchema);