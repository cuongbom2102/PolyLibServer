var express = require('express');
const Librarian = require("../Models/librarian");
const multer = require("multer");
var router = express.Router();


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
    const data = await Librarian.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('listLibrarian', { title: 'PolyLib', path: '/uploads/', librarian,data:data });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/delete', async function (req,res){
    const _id = req.query._id
    await Librarian.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await Librarian.find()
    res.redirect('/listLibrarian');
    res.render('listLibrarian', { title: 'PolyLib', data : data, path: '/uploads/' });

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
        const statusAdmin = req.body.status === 'librarian' ? '0' : '1';


        await Librarian.updateOne({_id : _id},{
            fullname:fullname,
            username: username,
            password: password,
            statusAdmin: statusAdmin,
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        })
        res.redirect('/listLibrarian');
    });
})
module.exports = router;
