const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    member: String, // Thanh vien
    librarian : String, // Thu thu cho muon sach
    goods : [{type : String}], // Sach
    billDate: Date, // Ngay mua
    price :  Number, // Gia tien
    status: String,
    deliveryAddress: String,
    transportFee: Number,
    total: Number,
    invoicePhoto: String
});

const Bill = mongoose.model('Bill', billSchema,'Bill');
module.exports = Bill;
