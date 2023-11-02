var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const GoodsCategory = require('../Models/goodsCategory')
const Goods = require('../Models/goods');

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
    const data = await GoodsCategory.find();
    const dataGoods = await Goods.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('goodsCategory', {
            title: 'PolyLib',
            data: data,
            path: '/uploads/',
            librarian,
            dataGoods:dataGoods
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


router.post('/addGoodsCategory', async (req, res, next) => {
    try {
        const name = req.body.name;

        await GoodsCategory.create({
            name: name,
        });

        res.redirect('/goodsCategory');
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
        next(error);
    }
});
router.get('/delete', async function (req,res){
    const _id = req.query._id
    await GoodsCategory.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await GoodsCategory.find()
    res.redirect('/goodsCategory');
    res.render('goodsCategory', { title: 'PolyLib', data : data, path: '/uploads/' });

})
router.post('/updateGoodsCategory', async (req, res) => {
    try {
        const _id = req.body._id;
        const name = req.body.name;

        await GoodsCategory.updateOne({ _id: _id }, {
            name: name,
        });

        res.redirect('/goodsCategory');
    } catch (error) {
        // Xử lý lỗi ở đây
        console.error(error);
    }
});
module.exports = router;

