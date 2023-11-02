var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const Author = require('../Models/author')
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
    const data = await Author.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('author', { title: 'PolyLib', data: data, path: '/uploads/',librarian });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/dataAuthor',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Author.find()
    res.status(200).json({
        data: data
    });
})
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
router.post('/addAuthor',(req, res, next) => {
    upload.single('imageAuthor')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước

        //Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn ảnh');
        }

        const fullName = req.body.fullName;
        const birthday = req.body.birthday;
        const nationality = req.body.nationality;
        const biography = req.body.biography;
        const image = 'uploads/' + req.file.filename;

        await Author.create({
            fullName: fullName,
            birthday: birthday,
            nationality: nationality,
            biography: biography,
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        });
        res.redirect('/Author');
    });
});


router.get('/delete', async function (req,res){
    const _id = req.query._id
    await Author.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await Author.find()
    res.redirect('/Author');
    res.render('Author', { title: 'PolyLib', data : data, path: '/uploads/' });

})

router.post('/updateAuthor',async function (req,res){
    upload.single('imageAuthor')(req, res, async function (err) {

        // Các xử lý lỗi như ở ví dụ trước
        const data = await Author.find()
        let image = '';
        // Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            image = data.image;
        }else
        {
            image = 'uploads/' + req.file.filename;
        }
        const _id = req.body._id;
        const fullName = req.body.fullName;
        const birthday = req.body.birthday;
        const nationality = req.body.nationality;
        const biography = req.body.biography;
        // const image = 'uploads/' + req.file.filename;

        await Author.updateOne({_id : _id},{
            fullName: fullName,
            birthday: birthday,
            nationality: nationality,
            biography: biography,
            image: image,
        })
        res.redirect('/Author');
    });
})
module.exports = router;
