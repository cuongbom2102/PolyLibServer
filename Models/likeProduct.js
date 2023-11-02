const mongoose = require('mongoose');

const likeProductSchema = new mongoose.Schema({
    book: String,
    goods:String,
    member:String,
});

const LikeProduct = mongoose.model('LikeProduct', likeProductSchema,'LikeProduct');

module.exports = LikeProduct;
