const mongoose = require('mongoose');

const librarianSchema = new mongoose.Schema({
    fullname: String,
    username: String,
    password : String,
    image : String,
    statusAdmin : String,
    imageQRCode:String,
});

const Librarian = mongoose.model('Librarian', librarianSchema,'Librarian');

module.exports = Librarian;
