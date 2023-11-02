module.exports = function(req, res, next) {
    if (req.session.isAuthenticated) {
        // Nếu đã đăng nhập, cho phép truy cập các đường dẫn
        next();
    } else {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        res.redirect('/login');
    }
};
