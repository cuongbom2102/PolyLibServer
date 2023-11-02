var express = require('express');
var router = express.Router();

const Book = require('../Models/book')
const Goods = require('../Models/goods')
const LoanSlip = require("../Models/loanSlip");
const SalesSlip = require("../Models/salesSlip");
const Bill = require("../Models/bill");
const Member = require("../Models/member");
const Librarians = require("../Models/librarian");
const Notifications = require("../Models/notifications");

/* GET users listing. */
router.get('/', async function(req, res, next) {
    const dataLoanSlip = await LoanSlip.find();
    const dataNotifications = await Notifications.find();
    const dataBook = await Book.find();
    const dataGoods = await Goods.find();
    const dataSalesSlip = await SalesSlip.find();
    const dataBill = await Bill.find();
    const dataMember = await Member.find();
    const dataLibrarian = await Librarians.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        res.render('notifications', {
            title: 'PolyLib',
            path: '/uploads/',
            librarian,
            dataLoanSlip:dataLoanSlip,
            dataBook:dataBook,
            dataGoods:dataGoods,
            dataSalesSlip:dataSalesSlip,
            dataBill:dataBill,
            dataMember:dataMember,
            dataLibrarian:dataLibrarian,
            dataNotifications:dataNotifications,
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});
module.exports = router;
