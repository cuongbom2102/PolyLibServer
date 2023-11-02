const mongoose = require('mongoose');

const salesSlipSchema = new mongoose.Schema({
    member: String, // Thanh vien
    librarian : String, // Thu thu cho muon sach
    book : [{type : String}], // Sach
    salesDate: Date, // Ngay mua
    price :  Number, // Gia tien
    status: String,
    deliveryAddress: String,
    transportFee: Number,
    total: Number,
    invoicePhoto: String
});
const SalesSlip = mongoose.model('SalesSlip', salesSlipSchema,'SalesSlip');
module.exports = SalesSlip;
