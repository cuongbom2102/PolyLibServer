var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const Librarian = require('../Models/librarian')
const session = require('express-session'); // Thêm dòng này
const MongoStore = require('connect-mongo'); // Thêm dòng này
main().catch(err => console.log(err));

async function main() {

    const db = 'mongodb+srv://cuongezs280667:cuongbom123@cluster0.l5rl33f.mongodb.net/PolyLib'
    await mongoose.connect(db);
}

router.use(session({
    secret: 'cuongbom2102', // Thay 'your-secret-key' bằng một chuỗi bí mật thực sự
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://cuongezs280667:cuongbom123@cluster0.l5rl33f.mongodb.net/PolyLib' }) // Sử dụng MongoStore để lưu session vào MongoDB
}));

/* GET users listing. */
router.get('/',async function(req, res, next) {
    const data = await Librarian.find().lean(); // Chuyển đổi thành plain JavaScript object
    const jsonData = JSON.parse(JSON.stringify(data)); // Chuyển đổi sang chuỗi JSON
    res.render('login', { title: 'PolyLib', data: jsonData });
});

router.post('/login', async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    // Kiểm tra thông tin đăng nhập ở đây
    const librarian = await Librarian.findOne({ username, password });

    if (librarian) {
        // Lưu thông tin đăng nhập vào session
        req.session.librarian = librarian;

        // Chuyển hướng đến trang dashboard hoặc trang chính của ứng dụng
        res.redirect('/index');
    } else {
        res.render('login', { title: 'PolyLib', data: jsonData, error: 'Thông tin đăng nhập không đúng' });
    }
});

module.exports = router;
