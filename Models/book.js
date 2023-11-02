const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: String, // Ten sach
    author : String, // Tac gia
    price : Number, // Gia tien
    image : String, // Hinh anh
    bookCategory : String, // The loai
    publicationYear: String, // Nam xuat ban
    detailBook:String // Chi tiet cua cuon sach
});

const Book = mongoose.model('Book', bookSchema,'Book');

module.exports = Book;
