var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')
const Member = require('../Models/member')
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
    const data = await Member.find();
    const librarian = req.session.librarian; // Lấy thông tin người dùng từ session
    if (librarian) {
        console.log('Librarian found in session:', librarian); // Kiểm tra thông tin người dùng trong console
        res.render('Member', { title: 'PolyLib', data: data, path: '/uploads/',librarian });
    } else {
        console.log('No librarian in session'); // Kiểm tra thông tin người dùng trong console
        res.redirect('/'); // Chưa đăng nhập, chuyển hướng về trang đăng nhập
    }
});

router.get('/dataMember',async function(req,res){
    // Luu y truyen dung tham so, neu truyen sai thi mongoose tu tao ra collection theo tham so
    const data = await Member.find()
    res.status(200).json({
        data: data
    });
})
const path = require("path");
const LikeProduct = require("../Models/likeProduct");
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
router.post('/addMember',(req, res, next) => {
    upload.single('imageMember')(req, res, async function (err) {
        // Các xử lý lỗi như ở ví dụ trước

        //Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            return res.status(400).send('Vui lòng chọn ảnh');
        }

        const fullName = req.body.fullName;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const phoneNumber = req.body.phoneNumber;
        const address = req.body.address;
        const image = 'uploads/' + req.file.filename;

        await Member.create({
            fullName: fullName,
            username: username,
            email: email,
            password: password,
            phoneNumber: phoneNumber,
            address: address,
            image: image, // Thêm các đường dẫn ảnh vào mảng hìnhAnh
        });
        res.redirect('/member');
    });
});

router.post('/addMemberInApp', upload.single('image'), async (req, res) => {
    const { fullName, phoneNumber, address,username,password,email } = req.body;

    if (!fullName || !phoneNumber || !address || !username || !password || !email) {
        return res.status(400).json({ message: 'Thiếu thông tin thanh vien' });
    }

    try {
        const newMember = await Member.create({
            fullName: fullName,
            username: username,
            email: email,
            password: password,
            address: address,
            phoneNumber: phoneNumber,
            image: req.file.path, // Lưu đường dẫn tạm thời của tệp tin đã tải lên
        });
        res.status(201).json({ message: 'Thêm thanh vien thành công', newItem: newMember });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.get('/delete', async function (req,res){
    const _id = req.query._id
    await Member.deleteOne({_id:_id})
    // Cap nhat lai danh sach sau khi xoa
    const data = await Member.find()
    res.redirect('/member');
    res.render('Member', { title: 'PolyLib', data : data, path: '/uploads/' });

})

router.delete('/deleteMemberInApp', async (req, res) => {
    try {
        const _id = req.query._id; // Lấy giá trị maXe từ query parameter
        const deletedItem = await Member.deleteOne({ _id: _id }); // Tìm và xóa item có id tương ứng
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/updateMember',async function (req,res){
    upload.single('imageMember')(req, res, async function (err) {

        // Các xử lý lỗi như ở ví dụ trước
        const data = await Member.find()
        let image = '';
        // Kiểm tra xem có file nào được upload hay không
        if (!req.file) {
            image = data.image;
        }else
        {
            image = 'uploads/' + req.file.filename;
        }
        const _id = req.body._id;
        const fullName = req.body.fullName;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const phoneNumber = req.body.phoneNumber;
        const address = req.body.address;
        // const image = 'uploads/' + req.file.filename;

        await Member.updateOne({_id : _id},{
            fullName: fullName,
            username: username,
            email: email,
            password: password,
            phoneNumber: phoneNumber,
            address: address,
            image: image,
        })
        res.redirect('/member');
    });
})
router.post('/updateMemberInApp', upload.single('imagesUpdate'), async (req, res) => {
    try {
        const _id = req.body._id;
        const fullName = req.body.fullName;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const phoneNumber = req.body.phoneNumber;
        const address = req.body.address;
        let image = req.file ? req.file.path : null;

        if (!fullName || !username || !email || !password || !phoneNumber || !address) {
            return res.status(400).json(req.body)
        }
        const updatedFields = {
            fullName: fullName,
            phoneNumber: phoneNumber,
            username: username,
            email: email,
            password: password,
            address: address
        };

        // Kiểm tra xem có tệp tin mới được gửi lên không
        if (image) {
            updatedFields.image = image;
        }

        const updatedItem = await Member.findOneAndUpdate(
            { _id: _id },
            updatedFields,
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item updated successfully', item: updatedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.post('/addLikeProductInApp', async (req, res) => {
    const { book, goods, member } = req.body;



    if (!book || !goods || !member) {
        return res.status(400).json(req.body);
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

module.exports = router;
