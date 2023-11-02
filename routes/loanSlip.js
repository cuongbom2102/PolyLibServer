var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
const Librarian = require('../Models/librarian')
const Book = require('../Models/book')
const Member = require("../Models/member");
const LoanSlip = require("../Models/loanSlip");
const Notifications = require("../Models/notifications")
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
const BookCategory = require("../Models/bookCategory");
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
    const dataLoanSlip = await LoanSlip.find();
    const deliveryAddress = await dataAddress.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('loanSlip', { title: 'PolyLib', dataMember: dataMember,dataBook:dataBook, dataLibrarian: dataLibrarian,dataLoanSlip:dataLoanSlip,deliveryAddress:deliveryAddress,librarian, path: '/uploads/' });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/dataLoanSlip',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await LoanSlip.find()
    res.status(200).json({
        data: data
    });
})

router.post('/addLoanSlip',(req, res, next) => {
    upload.single('imageLoanSlip')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước

        //Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn ảnh');
        }

        const date = req.body.date;
        const price = req.body.price;
        const status = req.body.status;
        const book = req.body.book;
        const member = req.body.member;
        const librarian = req.body.librarian;
        const image = 'uploads/' + req.file.filename;

        await LoanSlip.create({
            date: date,
            price: price,
            book: book,
            member: member,
            librarian:librarian,
            status : status === 'returned' ? '1' : '0',
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        });
        res.redirect('/loanSlip');
    });
});

router.post('/addLoanSlipInApp', upload.single('image'), async (req, res) => {
        const { member, book, librarian, borrowDate, duration, dueDate, total,transportFee, deliveryAddress, price, status,statusPayment } = req.body;

    if (!member || !book || !librarian  || !price || !status || !borrowDate || !duration || !dueDate || !total || !transportFee || !deliveryAddress || !statusPayment) {
        return res.status(400).json(req.body);    }

    try {

        let invoicePhoto = ''; // Mặc định không có đường dẫn tệp tin
        if (statusPayment === '0') {
            invoicePhoto = req.file.path; // Lưu đường dẫn tệp tin chỉ khi status là "0"
        }
        const bookItems = book.split(',');
        const newLoanSlip = await LoanSlip.create({
            member: member,
            book: bookItems,
            librarian: librarian,
            borrowDate: borrowDate,
            price:price,
            status:status,
            duration:duration,
            dueDate:dueDate,
            total:total,
            transportFee:transportFee,
            deliveryAddress:deliveryAddress,
            invoicePhoto: invoicePhoto
        });
        res.status(201).json({ message: 'Thêm phieu muon thành công', newItem: newLoanSlip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});



router.get('/delete', async function (req,res){
    const _id = req.query._id
    await LoanSlip.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await LoanSlip.find()
    res.redirect('/loanSlip');
    res.render('loanSlip', { title: 'PolyLib', data : data, path: '/uploads/' });

})

router.delete('/deleteLoanSlipInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await LoanSlip.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/updateLoanSlip',async function (req,res){
    upload.single('imageLoanSlip')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        const data = await LoanSlip.find()
        let image = '';
        // Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            image = data.image;
        }else {
            image = 'uploads/' + req.file.filename;
        }

        const _id = req.body._id;
        const date = req.body.date;
        const price = req.body.price;
        const status = req.body.status;
        const book = req.body.book;
        const member = req.body.member;
        const librarian = req.body.librarian;


        await LoanSlip.updateOne({_id : _id},{
            date: date,
            price: price,
            book: book,
            member: member,
            librarian:librarian,
            status : status === 'returned' ? '1' : '0',
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        })
        res.redirect('/loanSlip');
    });
})

router.post('/updateLoanSlipInApp', upload.single('imagesUpdate'), async (req, res) => {
    try {
        const _id = req.body._id;
        const member = req.body.member; // Lấy mã xe từ body của yêu cầu POST
        const book = req.body.book;
        const librarian = req.body.librarian;
        const date = req.body.date;
        const price = req.body.price;
        const status = req.body.status;
        const image = req.file.path; // Lấy danh sách tên hình ảnh từ các files upload

        const updatedItem = await LoanSlip.findOneAndUpdate(
            { _id: _id }, // Tìm sản phẩm có mã xe tương ứng
            { member: member, book: book, librarian: librarian, date:date,price:price,status:status, image: image }, // Cập nhật thông tin sản phẩm và danh sách hình ảnh
            { new: true } // Trả về sản phẩm sau khi đã cập nhật
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

router.post('/addNotifications',async (req, res, next) => {
    const { mem, content, librarian, status } = req.body;

    await Notifications.create({
        member: mem,
        content: content,
        librarian: librarian,
        status: status,
        notificationDate: new Date(),
    });
});

module.exports = router;
