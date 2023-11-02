var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const Goods = require('../Models/goods')
const GoodsCategory = require('../Models/goodsCategory')
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
    const data = await Goods.find();
    const dataGoodsCategory = await GoodsCategory.find();
    const dataMember = await Member.find();
    const dataLibrarian = await Librarian.find();
    const dataLikeProduct = await LikeProduct.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('Goods', {
            title: 'PolyLib',
            data: data,
            dataGoodsCategory : dataGoodsCategory,
            dataMember:dataMember,
            dataLibrarian:dataLibrarian,
            dataLikeProduct:dataLikeProduct,
            path: '/uploads/',
            librarian
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/dataGoods',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Goods.find()
    res.status(200).json({
        data: data
    });
})

router.post('/addGoods',(req, res, next) => {
    upload.single('imageGoods')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước

        //Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn ảnh');
        }

        const name = req.body.name;
        const price = req.body.price;
        const goodsCategory = req.body.goodsCategory;
        const image = 'uploads/' + req.file.filename;

        await Goods.create({
            name: name,
            price: price,
            goodsCategory: goodsCategory,
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        });
        res.redirect('/goods');
    });
});



router.get('/delete', async function (req,res){
    const _id = req.query._id
    await Goods.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await Goods.find()
    res.redirect('/goods');
    res.render('Goods', { title: 'PolyLib', data : data, path: '/uploads/' });

})

router.post('/updateGoods',async function (req,res){
    upload.single('imageGoods')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước
        const data = await Goods.find();
        let image = '';
        // Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            image = data.image;
        }else {
            image = 'uploads/' + req.file.filename;
        }

        const _id = req.body._id;
        const name = req.body.name;
        const price = req.body.price;
        const goodsCategory = req.body.goodsCategory;


        await Goods.updateOne({_id : _id},{
            name: name,
            price: price,
            goodsCategory: goodsCategory,
            image: image,
        })
        res.redirect('/goods');
    });
})

module.exports = router;

