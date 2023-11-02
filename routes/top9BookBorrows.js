var express = require('express');
var router = express.Router();

const Book = require('../Models/book')
const LoanSlip = require("../Models/loanSlip");
const Author = require("../Models/author");
const Category = require("../Models/bookCategory");

/* GET users listing. */
router.get('/', async function(req, res, next) {
    const dataLoanSlip = await LoanSlip.find();
    const dataBook = await Book.find();
    const dataAuthor = await Author.find();
    const dataBookCategory = await Category.find();
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
        .slice(0, 9);

    const topBooksInfo = topBorrowedBooks.map(bookId => {
        const book = dataBook.find(book => book._id.toString() === bookId);
        return {
            name: book.name,
            author: book.author,
            borrowCount: bookBorrowCounts[bookId],
            image: book.image,
            detailBook:book.detailBook,
            price:book.price,
            publicationYear:book.publicationYear,
            category:book.bookCategory

        };
    });

    if (librarian) {
        res.render('top9BookBorrows', {
            title: 'PolyLib',
            path: '/uploads/',
            librarian,
            topBooks: topBooksInfo,
            dataAuthor:dataAuthor,
            dataBookCategory:dataBookCategory
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }

});
module.exports = router;
