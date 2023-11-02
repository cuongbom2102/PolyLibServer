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
        res.render('changePassword', { title: 'PolyLib', data: data, path: '/uploads/',librarian });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.post('/changePassword', async function (req, res) {
    const librarian = req.session.librarian;
    const username = librarian.username;
    const passwordNew = req.body.passwordNew;

    try {
        await Librarian.updateOne({ username: username }, {
            password: passwordNew,
        });

        // Cập nhật mật khẩu trong session
        librarian.password = passwordNew;

        res.redirect('/changePassword');
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi cập nhật mật khẩu.');
    }
});
module.exports = router;
