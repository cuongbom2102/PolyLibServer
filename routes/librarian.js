var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const Librarian = require('../Models/librarian')
const multer = require ('multer')
main().catch(err => console.log(err));

async function main() {

    const db = 'mongodb+srv://cuongezs280667:cuongbom123@cluster0.l5rl33f.mongodb.net/PolyLib'
    await mongoose.connect(db);
}
/* GET users listing. */
router.get('/',async function(req, res, next) {
    const data = await Librarian.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('librarian', { title: 'PolyLib', path: '/uploads/', librarian,data:data });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/dataLibrarian',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Librarian.find()
    res.status(200).json({
        data: data
    });
})

const path = require("path");
const Book = require("../Models/book");
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
router.post('/addLibrarian',(req, res, next) => {
    upload.single('imageLibrarian')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        //Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn ảnh');
        }
        const fullname = req.body.fullname;
        const username = req.body.username;
        const password = req.body.password;
        const statusAdmin = req.body.statusAdmin === 'librarian' ? '0' : '1';
        const image = 'uploads/' + req.file.filename;

        await Librarian.create({
            fullname:fullname,
            username: username,
            password: password,
            statusAdmin: statusAdmin,
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        });
        res.redirect('/librarian');
    });
});

router.post('/addLibrarianInApp', upload.single('image'), async (req, res) => {
    const { fullname, username, password, statusAdmin } = req.body;

    if (!fullname || !username || !password || !statusAdmin) {
        return res.status(400).json({ message: 'Thiếu thông tin tai khoan' });
    }

    try {
        const newLibrarian = await Librarian.create({
            fullname: fullname,
            username: username,
            password: password,
            statusAdmin:statusAdmin,
            image: req.file.path, // Lưu đường dẫn tạm thời của tệp tin đã tải lên
        });
        res.status(201).json({ message: 'Thêm tai khoan thành công', newItem: newLibrarian });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


router.get('/delete', async function (req,res){
    const _id = req.query._id
    await Librarian.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await Librarian.find()
    res.redirect('/librarian');
    res.render('Librarian', { title: 'PolyLib', data : data, path: '/uploads/' });

})

router.post('/updateLibrarian',async function (req,res){
    upload.single('imageLibrarian')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        const data = await Librarian.find();
        let image = '';
        // Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            image = data.image;
        }else {
            image = 'uploads/' + req.file.filename;
        }

        const _id = req.body._id;
        const fullname = req.body.fullname;
        const username = req.body.username;
        const password = req.body.password;
        const statusAdmin = req.body.statusAdmin === 'librarian' ? '0' : '1';


        await Librarian.updateOne({_id : _id},{
            fullname:fullname,
            username: username,
            password: password,
            statusAdmin: statusAdmin,
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        })
        res.redirect('/librarian');
    });
})

router.post('/updateLibrarianInApp', async (req, res) => {
    try {
        const _id = req.body._id;
        const fullname = req.body.fullname;
        const username = req.body.username;
        const password = req.body.password;
        const statusAdmin = req.body.statusAdmin;
        const image = req.body.image;

        const updatedItem = await Librarian.findOneAndUpdate(
            { _id: _id },
            { fullname: fullname, username: username, password: password, statusAdmin:statusAdmin, image:image },
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
