var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')
const BookCategory = require('../Models/bookCategory')
const Book = require('../Models/book')
const Author = require('../Models/author')
const multer = require ('multer')
const Member = require("../Models/member");
const Librarian = require("../Models/librarian");
const LikeProduct = require("../Models/likeProduct");

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
    const dataBookCategory = await BookCategory.find();
    const dataAuthor = await Author.find();
    const dataBook = await Book.find();
    const dataMember = await Member.find();
    const dataLibrarian = await Librarian.find();
    const dataLikeProduct = await LikeProduct.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('book', {
            title: 'PolyLib',
            dataBookCategory: dataBookCategory,
            dataBook:dataBook,
            dataAuthor:dataAuthor,
            dataMember:dataMember,
            dataLibrarian:dataLibrarian,
            dataLikeProduct:dataLikeProduct,
            librarian,
            path: '/uploads/' });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/dataBook',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Book.find()
    res.status(200).json({
        data: data
    });
})

router.post('/addBook',(req, res, next) => {
    upload.single('imageBook')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước

        //Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn ảnh');
        }

        const name = req.body.name;
        const author = req.body.author;
        //const borrowingPrice = req.body.borrowingPrice;
        const publicationYear = req.body.publicationYear;
        const detailBook = req.body.detailBook;
        const price = req.body.price;
        const bookCategory = req.body.bookCategory;
        const image = 'uploads/' + req.file.filename;

        await Book.create({
            name: name,
            author: author,
            publicationYear: publicationYear,
            detailBook: detailBook,
            //borrowingPrice: borrowingPrice,
            price: price,
            bookCategory: bookCategory,
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        });
        res.redirect('/book');
    });
});
router.post('/addBookInApp', upload.single('image'), async (req, res) => {
    const { name, author, price, bookCategory } = req.body;

    if (!name || !author || !price || !bookCategory) {
        return res.status(400).json({ message: 'Thiếu thông tin sach' });
    }

    try {
        const newBook = await Book.create({
            name: name,
            author: author,
            price: price,
            bookCategory: bookCategory,
            image: req.file.path, // Lưu đường dẫn tạm thời của tệp tin đã tải lên
        });
        res.status(201).json({ message: 'Thêm sach thành công', newItem: newBook });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


router.get('/delete', async function (req,res){
    const _id = req.query._id
    await Book.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await Book.find()
    res.redirect('/book');
    res.render('Book', { title: 'PolyLib', data : data, path: '/uploads/' });

})

router.delete('/deleteBookInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await Book.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/updateBook',async function (req,res){
    upload.single('imageBook')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        const data = await Book.find();
        let image = '';
        // Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            image = data.image;
        }else {
            image = 'uploads/' + req.file.filename;
        }

        const _id = req.body._id;
        const name = req.body.name;
        const author = req.body.author;
        //const borrowingPrice = req.body.borrowingPrice;
        const publicationYear = req.body.publicationYear;
        const detailBook = req.body.detailBook;
        const price = req.body.price;
        const bookCategory = req.body.bookCategory;


        await Book.updateOne({_id : _id},{
            name: name,
            author: author,
            publicationYear: publicationYear,
            detailBook: detailBook,
            //borrowingPrice: borrowingPrice,
            price: price,
            bookCategory: bookCategory,
            image: image,
        })
        res.redirect('/book');
    });
})

router.post('/updateBookInApp', upload.single('imagesUpdate'), async (req, res) => {
    try {
        const _id = req.body._id;
        const name = req.body.name; // Lấy mã xe từ body của yêu cầu POST
        const author = req.body.author;
        const price = req.body.price;
        const bookCategory = req.body.bookCategory;
        const image = req.file.path; // Lấy danh sách tên hình ảnh từ các files upload

        const updatedItem = await Book.findOneAndUpdate(
            { _id: _id }, // Tìm sản phẩm có mã xe tương ứng
            { name: name, author: author, price: price, bookCategory:bookCategory, image: image }, // Cập nhật thông tin sản phẩm và danh sách hình ảnh
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


module.exports = router;
