var express = require('express');
var router = express.Router();

const Book = require('../Models/book')
const Member = require("../Models/member");
const LoanSlip = require("../Models/loanSlip");
const SalesSlip = require("../Models/salesSlip");
const Bill = require("../Models/bill");
const Goods = require("../Models/goods");
const Author = require("../Models/author");
const GoodsCategory = require("../Models/goodsCategory");
const BookCategory = require("../Models/bookCategory");
const Librarian = require("../Models/librarian");
const LikeProduct = require("../Models/likeProduct");
const ShopppingCartBook = require("../Models/shoppingCartBook");
const ShopppingCartGoods = require("../Models/shoppingCartGoods");
const DeliveryAddress = require("../Models/deliveryAddress");
const Rules = require("../Models/rules");
const Notification = require("../Models/notifications");

const multer = require("multer");

/* GET users listing. */
router.get('/', async function(req, res, next) {
    const dataLoanSlip = await LoanSlip.find();
    const dataSalesSlip = await SalesSlip.find();
    const dataGoods = await Goods.find();
    const dataBill = await Bill.find();
    const dataBook = await Book.find();
    const dataAuthor = await Author.find();
    const dataGoodsCategory = await GoodsCategory.find();
    const dataBookCategory = await BookCategory.find();
    const dataMember = await Member.find();
    const dataLibrarian = await Librarian.find();
    const dataLikeProduct = await LikeProduct.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session


    // Tính sách được mượn nhiều nhất
    const bookBorrowCounts = {};
    dataLoanSlip.forEach(loanSlip => {
      loanSlip.book.forEach(bookId => {
        bookBorrowCounts[bookId] = (bookBorrowCounts[bookId] || 0) + 1;
      });
    });

    const topBorrowedBooks = Object.keys(bookBorrowCounts)
        .sort((a, b) => bookBorrowCounts[b] - bookBorrowCounts[a])
        .slice(0, 3);

    const topBooksInfo = topBorrowedBooks.map(bookId => {
      const book = dataBook.find(book => book._id.toString() === bookId);
      return {
        id:book._id,
        name: book.name,
        author: book.author,
        borrowCount: bookBorrowCounts[bookId],
        image: book.image,
        category: book.bookCategory,
        detailBook:book.detailBook,
        price:book.price,
        publicationYear:book.publicationYear,
      };
    });

    // Tính sách được bán nhiều nhất
    const bookSalesCounts = {};
    dataSalesSlip.forEach(salesSlip => {
        salesSlip.book.forEach(bookId => {
            bookSalesCounts[bookId] = (bookSalesCounts[bookId] || 0) + 1;
        });
    });

    const topSalesBooks = Object.keys(bookSalesCounts)
        .sort((a, b) => bookSalesCounts[b] - bookSalesCounts[a])
        .slice(0, 3);

    const topBooksSaleInfo = topSalesBooks.map(bookId => {
        const book = dataBook.find(book => book._id.toString() === bookId);
        return {
            id:book._id,
            name: book.name,
            author: book.author,
            salesCount: bookSalesCounts[bookId],
            image: book.image,
            category: book.bookCategory,
            detailBook:book.detailBook,
            price:book.price,
            publicationYear:book.publicationYear,

        };
    });

    // Tính sản phẩm được bán nhiều nhất
    const goodsSalesCounts = {};
    dataBill.forEach(bill => {
        bill.goods.forEach(goodsID => {
            goodsSalesCounts[goodsID] = (goodsSalesCounts[goodsID] || 0) + 1;
        });
    });

    const topSalesGoods = Object.keys(goodsSalesCounts)
        .sort((a, b) => goodsSalesCounts[b] - goodsSalesCounts[a])
        .slice(0, 3);

    const topGoodsSaleInfo = topSalesGoods.map(goodsId => {
        const goods = dataGoods.find(goods => goods._id.toString() === goodsId);
        return {
            id:goods._id,
            name: goods.name,
            salesCount: goodsSalesCounts[goodsId],
            image: goods.image,
            price: goods.price,
            category:goods.goodsCategory
        };
    });



    // Tính tổng số lần mượn và bán cho mỗi thành viên
    const memberStats = {};

// Duyệt qua thông tin từ dataLoanSlip
    dataLoanSlip.forEach(loanSlip => {
        const member = loanSlip.member;
        if (!memberStats[member]) {
            memberStats[member] = { borrowCount: 0, salesCount: 0 };
        }
        memberStats[member].borrowCount += loanSlip.book.length;
    });

// Duyệt qua thông tin từ dataSalesSlip
    dataSalesSlip.forEach(salesSlip => {
        const member = salesSlip.member;
        if (!memberStats[member]) {
            memberStats[member] = { borrowCount: 0, salesCount: 0 };
        }
        memberStats[member].salesCount += salesSlip.book.length;
    });

// Tạo một mảng thành viên với thông tin về tổng số lần mua và mượn
    const membersWithStats = Object.keys(memberStats).map(member => ({
        member: dataMember.find(a => a._id.equals(member))?.fullName,
        total: memberStats[member].borrowCount + memberStats[member].salesCount,
        borrowCount: memberStats[member].borrowCount,
        salesCount: memberStats[member].salesCount,
        image: dataMember.find(a => a._id.equals(member))?.image,
        phoneNumber: dataMember.find(a => a._id.equals(member))?.phoneNumber,
    }));

// Sắp xếp mảng theo tổng số lần từ cao đến thấp
    membersWithStats.sort((a, b) => b.total - a.total);

// Lấy thông tin của 3 thành viên hoạt động tích cực nhất
    const top3Members = membersWithStats.slice(0, 3);

    // Tính tổng số lần mượn và bán cho mỗi tác giả
    const authorStats = {};

// Duyệt qua thông tin từ dataLoanSlip
    dataLoanSlip.forEach(loanSlip => {
        loanSlip.book.forEach(bookId => {
            const book = dataBook.find(book => book._id.toString() === bookId);
            if (book) {
                if (!authorStats[book.author]) {
                    authorStats[book.author] = { borrowCount: 0, salesCount: 0 };
                }
                authorStats[book.author].borrowCount += 1;
            }
        });
    });

// Duyệt qua thông tin từ dataSalesSlip
    dataSalesSlip.forEach(salesSlip => {
        salesSlip.book.forEach(bookId => {
            const book = dataBook.find(book => book._id.toString() === bookId);
            if (book) {
                if (!authorStats[book.author]) {
                    authorStats[book.author] = { borrowCount: 0, salesCount: 0 };
                }
                authorStats[book.author].salesCount += 1;
            }
        });
    });

// Tạo một mảng tác giả với thông tin về tổng số lần được mượn và bán
    const authorsWithStats = Object.keys(authorStats).map(author => ({
        author: dataAuthor.find(a => a._id.equals(author))?.fullName,
        total: authorStats[author].borrowCount + authorStats[author].salesCount,
        borrowCount: authorStats[author].borrowCount,
        salesCount: authorStats[author].salesCount,
        image: dataAuthor.find(a => a._id.equals(author))?.image,
        birthday: dataAuthor.find(a => a._id.equals(author))?.birthday,
        nationality: dataAuthor.find(a => a._id.equals(author))?.nationality,
        biography: dataAuthor.find(a => a._id.equals(author))?.biography,

    }));

// Sắp xếp mảng theo tổng số lần từ cao đến thấp
    authorsWithStats.sort((a, b) => b.total - a.total);

// Lấy thông tin của 10 tác giả đầu tiên
    const top10Authors = authorsWithStats.slice(0, 10);


    if (librarian) {
        console.log(librarian)
      res.render('index', {
        title: 'PolyLib',
        path: '/uploads/',
        librarian,
        topBooks: topBooksInfo,
        topBooksSales: topBooksSaleInfo,
        topGoodsSales:topGoodsSaleInfo,
        top10Authors:top10Authors,
        top3Members:top3Members,
        dataAuthor:dataAuthor,
        dataGoodsCategory:dataGoodsCategory,
        dataBookCategory:dataBookCategory,
        dataMember:dataMember,
        dataLibrarian:dataLibrarian,
        dataLikeProduct:dataLikeProduct,
      });
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

router.get('/dataBook',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Book.find()
    res.status(200).json({
        data: data
    });
})

router.get('/dataGoods',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Goods.find()
    res.status(200).json({
        data: data
    });
})


router.get('/dataSalesSlip',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await SalesSlip.find()
    res.status(200).json({
        data: data
    });
})

router.get('/dataLoanSlip',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await LoanSlip.find()
    res.status(200).json({
        data: data
    });
})

router.get('/dataBookCategory',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await BookCategory.find()
    res.status(200).json({
        data: data
    });
})

router.get('/dataGoodsCategory',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await GoodsCategory.find()
    res.status(200).json({
        data: data
    });
})

router.get('/dataBill',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Bill.find()
    res.status(200).json({
        data: data
    });
})
router.get('/dataLibrarian',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Librarian.find()
    res.status(200).json({
        data: data
    });
})


router.get('/dataLikeProduct',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await LikeProduct.find()
    res.status(200).json({
        data: data
    });
})

router.get('/dataDeliveryAddress',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await DeliveryAddress.find()
    res.status(200).json({
        data: data
    });
})
router.get('/dataRules',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Rules.find()
    res.status(200).json({
        data: data
    });
})

router.get('/dataNotification',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Notification.find()
    res.status(200).json({
        data: data
    });
})



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

router.post('/addDeliveryAddress', upload.single('image'), async (req, res) => {
    const {nameAddress, member } = req.body;
    if (!member || !nameAddress) {
        return res.status(400).json(req.body)
    }

    try {
        const newLikeProduct = await DeliveryAddress.create({
            nameAddress: nameAddress,
            member: member,

        });
        res.status(201).json({ message: 'Thêm thành công', newItem: newLikeProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


router.post('/addLikeProductInApp',  upload.single('image'), async (req, res) => {
    const { book, goods, member } = req.body;
    if (!member) {
        return res.status(400).json(req.body)
    }

    try {
        const newLikeProduct = await LikeProduct.create({
            book: book,
            goods: goods,
            member: member,

        });
        res.status(201).json({ message: 'Thêm thành công', newItem: newLikeProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


router.delete('/deleteLikeProductInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await LikeProduct.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});
router.get('/dataShoppingCartBook',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await ShopppingCartBook.find()
    res.status(200).json({
        data: data
    });
})

router.post('/addShoppingCartBookInApp',  upload.single('image'), async (req, res) => {
    const { book, member } = req.body;
    if (!member || !book) {
        return res.status(400).json(req.body)
    }
    try {
        const newItem = await ShopppingCartBook.create({
            book: book,
            member: member,

        });
        res.status(201).json({ message: 'Thêm thành công', newItem: newItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.delete('/deleteShoppingCartBookInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await ShopppingCartBook.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/dataShoppingCartGoods',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await ShopppingCartGoods.find()
    res.status(200).json({
        data: data
    });
})

router.post('/addShoppingCartGoodsInApp',  upload.single('image'), async (req, res) => {
    const { goods, member } = req.body;
    if (!member || !goods) {
        return res.status(400).json(req.body)
    }
    try {
        const newItem = await ShopppingCartGoods.create({
            goods: goods,
            member: member,

        });
        res.status(201).json({ message: 'Thêm thành công', newItem: newItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.delete('/deleteShoppingCartGoodsInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await ShopppingCartGoods.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      console.error(err);
    }
    res.redirect('/'); // Chuyển hướng về trang đăng nhập sau khi đăng xuất
  });
});

module.exports = router;
