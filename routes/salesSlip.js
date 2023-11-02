var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const SalesSlip = require('../Models/salesSlip')
const Librarian = require('../Models/librarian')
const Book = require('../Models/book')
const Member = require("../Models/member");
const dataAddress = require("../Models/deliveryAddress");
const multer = require ('multer')
main().catch(err => console.log(err));

async function main() {
    // tai khaoan : mat khau
    // Products la ten cua database
    const db = 'mongodb+srv://cuongezs280667:cuongbom123@cluster0.l5rl33f.mongodb.net/PolyLib'
    await mongoose.connect(db);
}

const path = require("path");
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

/* GET users listing. */
router.get('/',async function(req, res, next) {
    const dataMember = await Member.find();
    const dataBook = await Book.find();
    const dataLibrarian = await Librarian.find();
    const data = await SalesSlip.find();
    const deliveryAddress = await dataAddress.find();

    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('salesSlip', {
            title: 'PolyLib',
            dataMember: dataMember,
            dataBook:dataBook,
            dataLibrarian: dataLibrarian,
            data: data,
            deliveryAddress:deliveryAddress,
            path: '/uploads/',librarian });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/dataSalesSlip',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await SalesSlip.find()
    res.status(200).json({
        data: data
    });
})

router.post('/addSalesSlipInApp', upload.single('image'),async (req, res) => {
    const { member, book, librarian, salesDate, price, status, transportFee,total,deliveryAddress } = req.body;

    if (!member || !book || !librarian || !price || !status || !salesDate || !transportFee || !total || !deliveryAddress) {
        return res.status(400).json(req.body);
    }



    try {

        let invoicePhoto = ''; // Mặc định không có đường dẫn tệp tin
        if (status === '0') {
            invoicePhoto = req.file.path; // Lưu đường dẫn tệp tin chỉ khi status là "0"
        }
        const bookItems = book.split(',');
        const newSalesSlip = await SalesSlip.create({
            member: member,
            book: bookItems,
            librarian: librarian,
            salesDate: salesDate,
            price: price,
            status: status,
            transportFee: transportFee,
            total: total,
            deliveryAddress: deliveryAddress,
            invoicePhoto: invoicePhoto
        });
        res.status(201).json({ message: 'Thêm phiếu bán thành công', newItem: newSalesSlip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.get('/delete', async function (req,res){
    const _id = req.query._id
    await SalesSlip.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await SalesSlip.find()
    res.redirect('/salesSlip');
    res.render('salesSlip', { title: 'PolyLib', data : data, path: '/uploads/' });
})

router.delete('/deleteSalesSlipInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await SalesSlip.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/updateSalesSlipInApp', async (req, res) => {
    try {
        const _id = req.body._id;
        const member = req.body.member;
        const book = req.body.book;
        const librarian = req.body.librarian;
        const salesDate = req.body.salesDate;
        const price = req.body.price;
        const status = req.body.status;

        const updatedItem = await SalesSlip.findOneAndUpdate(
            { _id: _id },
            { member: member, book: book, librarian: librarian, salesDate: salesDate, price: price, status: status },
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
module.exports = router;
