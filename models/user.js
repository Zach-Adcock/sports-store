const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

const userSchema = new Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true }
    }
);

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, 10, null)
}

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}


module.exports = mongoose.model('User', userSchema);