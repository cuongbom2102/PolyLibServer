const mongoose = require('mongoose');

const bookCategorySchema = new mongoose.Schema({
    name: String, // Ten the loai
});

const BookCategory = mongoose.model('bookCategory', bookCategorySchema,'bookCategory');

module.exports = BookCategory;
