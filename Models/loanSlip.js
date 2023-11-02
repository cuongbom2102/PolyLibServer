const mongoose = require('mongoose');

const loanSlipSchema = new mongoose.Schema({
    member: String, // Thanh vien
    librarian : String, // Thu thu cho muon sach
    book : [{type : String}], // Sach
    borrowDate: Date, // Ngay muon
    duration: Number, // Thoi han
    dueDate: Date, // Nhay het han
    price :  Number, // Gia tien
    status: String, // Trang thai
    deliveryAddress: String,
    transportFee: Number,
    total: Number,
    invoicePhoto: String

});


const LoanSlip = mongoose.model('LoanSlip', loanSlipSchema,'LoanSlip');
module.exports = LoanSlip;
