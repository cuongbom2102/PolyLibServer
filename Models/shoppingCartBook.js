const mongoose = require('mongoose');

const shoppingCartBookSchema = new mongoose.Schema({
    member: String,
    book: String
});
const ShoppingCartBook = mongoose.model('ShoppingCartBook', shoppingCartBookSchema,'ShoppingCartBook');

module.exports = ShoppingCartBook;
