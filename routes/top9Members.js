var express = require('express');
var router = express.Router();

const Member = require("../Models/member");
const LoanSlip = require("../Models/loanSlip");
const SalesSlip = require("../Models/salesSlip");
const Author = require("../Models/author");

/* GET users listing. */
router.get('/', async function(req, res, next) {
    const dataLoanSlip = await LoanSlip.find();
    const dataSalesSlip = await SalesSlip.find();
    const dataAuthor = await Author.find();
    const dataMember = await Member.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session


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
    const topMembers = membersWithStats.slice(0, 9);

    if (librarian) {
        res.render('top9Members', {
            title: 'PolyLib',
            path: '/uploads/',
            librarian,
            topMembers:topMembers,
            dataAuthor:dataAuthor,
        });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }

});

module.exports = router;

