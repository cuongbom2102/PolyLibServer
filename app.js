var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var memberRouter = require('./routes/member');
var bookRouter = require('./routes/book');
var librarianRouter = require('./routes/librarian');
var bookCategoryRouter = require('./routes/bookCategory');
var loanSlipRouter = require('./routes/loanSlip');
var loginRouter = require('./routes/login');
var authorRouter = require('./routes/author');
var goodsCategoryRouter = require('./routes/goodsCategory');
var goodsRouter = require('./routes/goods');
var billRouter = require('./routes/bill');
var salesSlipRouter = require('./routes/salesSlip');
var top9BookBorrowsRouter = require('./routes/top9BookBorrows');
var top9BookSalesRouter = require('./routes/top9BookSales');
var top9MembersRouter = require('./routes/top9Members');
var revenueRouter = require('./routes/revenue');
var top9GoodsSalesRouter = require('./routes/top9GoodsSales');
var listLibrarianRouter = require('./routes/listLibrarian');
var changePasswordRouter = require('./routes/changePassword');
var notificationsRouter = require('./routes/notifications');
var repliesFromUserRouter = require('./routes/repliesFromUser');
var rulesRouter = require('./routes/rules');

var app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', loginRouter);
app.use('/users', usersRouter);
app.use('/bookCategory', bookCategoryRouter);
app.use('/member', memberRouter);
app.use('/book', bookRouter);
app.use('/librarian', librarianRouter);
app.use('/loanSlip', loanSlipRouter);
app.use('/index', indexRouter);
app.use('/author', authorRouter);
app.use('/changePassword', changePasswordRouter);
app.use('/goodsCategory', goodsCategoryRouter);
app.use('/goods', goodsRouter);
app.use('/bill', billRouter);
app.use('/salesSlip', salesSlipRouter);
app.use('/listLibrarian', listLibrarianRouter);
app.use('/top9BookBorrows', top9BookBorrowsRouter);
app.use('/top9BookSales', top9BookSalesRouter);
app.use('/top9Members', top9MembersRouter);
app.use('/top9GoodsSales', top9GoodsSalesRouter);
app.use('/notifications', notificationsRouter);
app.use('/repliesFromUser', repliesFromUserRouter);
app.use('/rules', rulesRouter);
app.use('/revenue', revenueRouter);
app.use("/uploads", express.static('uploads'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
