const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const NhanVien = mongoose.model('NhanVien');
const multer = require('multer');
const bcrypt = require('bcrypt');

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/avatar');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Endpoint để lấy thông tin người dùng (Profile)
router.get('/profile', async (req, res) => {
    try {
      const email = req.session.user.email; // Kiểm tra session có giá trị hay không
      if (!email) {
        return res.status(400).send('Session không hợp lệ');
      }
      const nhanVien = await NhanVien.findOne({ email: email });
  
      if (nhanVien) {
        res.render('profile', { layout: 'layout/admin-layout', nhanVien });
      } else {
        res.status(404).send('Không tìm thấy nhân viên');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi server');
    }
  });  

// Route xử lý cập nhật sản phẩm
router.put('/edit/:userId', upload.single('hinhNhanVien'), async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Lấy thông tin sản phẩm cũ từ cơ sở dữ liệu để giữ nguyên hình ảnh nếu không có file mới
        const existingUserId = await NhanVien.findOne({ id_NV: userId });
        
        if (!existingUserId) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin để cập nhật' });
        }

        // Cập nhật các thuộc tính còn lại
        updateData.tenNhanVien = req.body.tenNhanVien;
        
        // Kiểm tra nếu có ảnh mới thì cập nhật, nếu không giữ nguyên hình ảnh cũ
        updateData.hinhNhanVien = req.file != null? `images/avatar/${req.file.filename}` : existingUserId.hinhNhanVien;

        updateData.cccd = req.body.cccd;
        updateData.diaChi = req.body.diaChi;
        updateData.email = req.body.email;
        updateData.sdt = req.body.sdt;
        

        // Tìm và cập nhật sản phẩm trong cơ sở dữ liệu
        const updatedUser = await NhanVien.findOneAndUpdate({ id_NV: userId }, updateData, { new: true });

        res.json({ message: 'Cập nhật thông tin thành công', updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin' });
    }
});


router.post('/changePassword/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        
        console.log('Request Body:', req.body); // Add this line for debugging

        // Check if all required fields are present
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
        }

        // Find the user based on userId
        const existingUser = await NhanVien.findOne({ id_NV: userId });
        if (!existingUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng!' });
        }

        // Check new password confirmation
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Xác nhận mật khẩu không khớp!' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        existingUser.password = hashedPassword;
        await existingUser.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thay đổi mật khẩu' });
    }
});

// Endpoint thay đổi mật khẩu
router.post("/change-password", async (req, res) => {
    const { uname, newPassword } = req.body;

    // Kiểm tra các tham số đầu vào
    if (!uname || !newPassword) {
        return res.status(400).json({ success: false, message: "Thông tin không hợp lệ!" });
    }
    if(uname == newPassword){
        return res.status(400).json({ success: false, message: "Mật khẩu mới không được trùng với mật khẩu cũ" });
    }

    try {
        // Tìm user theo username
        const user = await NhanVien.findOne({ username: uname });
        if (!user) {
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi đổi mật khẩu." });
    }
});



module.exports = router;
