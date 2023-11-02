var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const BookCategory = require('../Models/bookCategory');
const Book = require('../Models/book');
const Author = require("../Models/author");
const multer = require ('multer')
main().catch(err => console.log(err));

async function main() {
    // tai khaoan : mat khau
    // Products la ten cua database
    const db = 'mongodb+srv://cuongezs280667:cuongbom123@cluster0.l5rl33f.mongodb.net/PolyLib'
    await mongoose.connect(db);
}
/* GET users listing. */
router.get('/',async function(req, res, next) {
    const data = await BookCategory.find();
    const dataBook = await Book.find();
    const dataAuthor = await Author.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('bookCategory', {
            title: 'PolyLib',
            path: '/uploads/',
            librarian,
            data:data,
            dataBook:dataBook,
            dataAuthor:dataAuthor,
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});
router.get('/dataBookCategory',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await BookCategory.find()
    res.status(200).json({
        data: data
    });
})

const path = require("path");
const Member = require("../Models/member");
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
router.post('/addBookCategory',(req, res, next) => {
    upload.single('imageBookCategory')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        //Kiểm tra xem có file nào được upload hay không
        const name = req.body.name;
        await BookCategory.create({
            name: name,
        });
        res.redirect('/bookCategory');
    });
});

router.post('/addBookCategoryInApp', upload.single('image'), async (req, res) => {
    const { name } = req.body;

    if (!name ) {
        return res.status(400).json({ message: 'Thiếu thông tin sach' });
    }

    try {
        const newBookCategory = await BookCategory.create({
            name: name,
            image: req.file.path, // Lưu đường dẫn tạm thời của tệp tin đã tải lên
        });
        res.status(201).json({ message: 'Thêm sach thành công', newItem: newBookCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
router.get('/delete', async function (req,res){
    const _id = req.query._id
    await BookCategory.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await BookCategory.find()
    res.redirect('/bookCategory');
    res.render('BookCategory', { title: 'PolyLib', data : data, path: '/uploads/' });

})
router.delete('/deleteBookCategoryInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await BookCategory.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
router.post('/updateBookCategory',async function (req,res){
    upload.single('imageBookCategory')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước


        const _id = req.body._id;
        const name = req.body.name;

        await BookCategory.updateOne({_id : _id},{
            name: name,
        })
        res.redirect('/bookCategory');
    });
})

router.post('/updateBookCategoryInApp', upload.single('imagesUpdate'), async (req, res) => {
    try {
        const _id = req.body._id;
        const name = req.body.name; // Lấy mã xe từ body của yêu cầu POST
        const image = req.file.path; // Lấy danh sách tên hình ảnh từ các files upload

        const updatedItem = await BookCategory.findOneAndUpdate(
            { _id: _id }, // Tìm sản phẩm có mã xe tương ứng
            { name: name, image: image }, // Cập nhật thông tin sản phẩm và danh sách hình ảnh
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
