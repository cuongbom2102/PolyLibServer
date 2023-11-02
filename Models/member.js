const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    fullName: String, // Ho ten
    username: String, // Ten dang nhap app
    email: String, // Email
    password: String, // Mat khau
    phoneNumber : String, // So dien thoai
    address : String, // Dia chi
    image : String // Anh dai dien
});
const Member = mongoose.model('Member', memberSchema,'Member');
module.exports = Member;
