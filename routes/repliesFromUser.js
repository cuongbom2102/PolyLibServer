var express = require('express');
var router = express.Router();
const multer = require("multer");

const Book = require('../Models/book')
const Goods = require('../Models/goods')
const LoanSlip = require("../Models/loanSlip");
const SalesSlip = require("../Models/salesSlip");
const Bill = require("../Models/bill");
const Member = require("../Models/member");
const Librarians = require("../Models/librarian");
const RepliesFromUser = require("../Models/repliesFromUser")
/* GET users listing. */
router.get('/', async function(req, res, next) {
    const dataLoanSlip = await LoanSlip.find();
    const dataReplies = await RepliesFromUser.find();
    const dataBook = await Book.find();
    const dataGoods = await Goods.find();
    const dataSalesSlip = await SalesSlip.find();
    const dataBill = await Bill.find();
    const dataMember = await Member.find();
    const dataLibrarian = await Librarians.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        res.render('repliesFromUser', {
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
            dataReplies:dataReplies,
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Duong dan luu tru file
    },
    // Tu dong dat ten anh la thoi gian hien tai + 1 so random
    filename: function (req, file, cb) {
        cb(null,file.originalname);
    }
});
const upload = multer({
    storage: storage,
});

router.post('/addRepliesFromUser', upload.single('image'), async (req, res) => {
    const {content, member, repliesDate } = req.body;
    if (!member || !content || !repliesDate) {
        return res.status(400).json(req.body)
    }

    try {
        const newReply = await RepliesFromUser.create({
            content: content,
            member: member,
            repliesDate:repliesDate

        });
        res.status(201).json({ message: 'Thêm thành công', newItem: newReply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
module.exports = router;
