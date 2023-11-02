var express = require('express');
var router = express.Router();

const Bill = require("../Models/bill");
const Goods = require("../Models/goods");
const Category = require("../Models/goodsCategory");

/* GET users listing. */
router.get('/', async function(req, res, next) {
    const dataGoods = await Goods.find();
    const dataBill = await Bill.find();
    const dataGoodsCategory = await Category.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session


    // Tính sản phẩm được bán nhiều nhất
    const goodsSalesCounts = {};
    dataBill.forEach(bill => {
        bill.goods.forEach(goodsID => {
            goodsSalesCounts[goodsID] = (goodsSalesCounts[goodsID] || 0) + 1;
        });
    });

    const topSalesGoods = Object.keys(goodsSalesCounts)
        .sort((a, b) => goodsSalesCounts[b] - goodsSalesCounts[a])
        .slice(0, 9);

    const topGoodsSaleInfo = topSalesGoods.map(goodsId => {
        const goods = dataGoods.find(goods => goods._id.toString() === goodsId);
        return {
            name: goods.name,
            salesCount: goodsSalesCounts[goodsId],
            image: goods.image,
            price: goods.price,
            category: goods.goodsCategory,

        };
    });

    if (librarian) {
        res.render('top9GoodsSales', {
            title: 'PolyLib',
            path: '/uploads/',
            librarian,
            topGoodsSales:topGoodsSaleInfo,
            dataGoodsCategory:dataGoodsCategory
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }

});
module.exports = router;
