var express = require('express');
var router = express.Router();

const Book = require('../Models/book')
const SalesSlip = require("../Models/salesSlip");
const Author = require("../Models/author");
const Category = require("../Models/bookCategory");

/* GET users listing. */
router.get('/', async function(req, res, next) {
    const dataSalesSlip = await SalesSlip.find();
    const dataBook = await Book.find();
    const dataAuthor = await Author.find();
    const dataBookCategory = await Category.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session

    // Tính sách được bán nhiều nhất
    const bookSalesCounts = {};
    dataSalesSlip.forEach(salesSlip => {
        salesSlip.book.forEach(bookId => {
            bookSalesCounts[bookId] = (bookSalesCounts[bookId] || 0) + 1;
        });
    });

    const topSalesBooks = Object.keys(bookSalesCounts)
        .sort((a, b) => bookSalesCounts[b] - bookSalesCounts[a])
        .slice(0, 9);

    const topBooksSaleInfo = topSalesBooks.map(bookId => {
        const book = dataBook.find(book => book._id.toString() === bookId);
        return {
            name: book.name,
            author: book.author,
            salesCount: bookSalesCounts[bookId],
            image: book.image,
            detailBook:book.detailBook,
            price:book.price,
            publicationYear:book.publicationYear,
            category:book.bookCategory
        };
    });

    if (librarian) {
        res.render('top9BookSales', {
            title: 'PolyLib',
            path: '/uploads/',
            librarian,
            topBooksSales: topBooksSaleInfo,
            dataAuthor:dataAuthor,
            dataBookCategory:dataBookCategory
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }

});

module.exports = router;
