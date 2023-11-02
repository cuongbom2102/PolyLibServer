var express = require('express');
var router = express.Router();


const Librarians = require("../Models/librarian");
const Rules = require("../Models/rules");

/* GET users listing. */
router.get('/', async function(req, res, next) {

    const dataLibrarian = await Librarians.find();
    const dataRules = await Rules.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        res.render('rules', {
            title: 'PolyLib',
            path: '/uploads/',
            librarian,
            dataLibrarian:dataLibrarian,
            dataRules:dataRules,
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

const path = require("path");
const multer = require("multer");
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

router.post('/addRules',(req, res, next) => {
    upload.single('imageRules')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        //Kiểm tra xem có file nào được upload hay không
        const content = req.body.content;
        const librarian = req.body.librarian;
        await Rules.create({
            content: content,
            librarian: librarian,
            rulesDate: new Date()
        });
        res.redirect('/rules');
    });
});
router.get('/delete', async function (req,res){
    const _id = req.query._id
    await Rules.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await Rules.find()
    res.redirect('/rules');
    res.render('rules', { title: 'PolyLib', data : data, path: '/uploads/' });

})

router.post('/updateRules',async function (req,res){
    upload.single('imageRules')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        const _id = req.body._id;
        const content = req.body.content;
        const librarian = req.body.librarian;
        const rulesDate = req.body.rulesDate;

        await Rules.updateOne({_id : _id},{
            content: content,
            librarian: librarian,
            rulesDate: rulesDate
        })
        res.redirect('/rules');
    });
})

module.exports = router;
