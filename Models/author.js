const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    fullName: String, // Ho ten
    birthday : Date, // Sinh nhat
    nationality : String, // Quoc tich
    image : String, // Hinh anh
    biography : String, // Tieu su
});

const Author = mongoose.model('Author', authorSchema,'Author');

module.exports = Author;
