var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const usernapi = require('../API/userapi')
const NhanVien = require('../models/NhanVien'); 
// Đăng nhập
router.get('/', (req, res) => {
    res.render('login', { title: 'Đăng nhập', layout: false });
});

//Kiểm tra hợp lệ
router.post('/', async (req, res) => {
  const { uname, psw } = req.body;

  try {
      let nhanVien = await NhanVien.findOne({ username: uname });
      if (nhanVien) {
          // Kiểm tra mật khẩu
          const isPasswordValid = await bcrypt.compare(psw, nhanVien.password);

          if (isPasswordValid) {
            if (nhanVien.khoa) {
                return res.render('login', {
                  us: uname,
                  msg: 'Tài khoản của bạn đã bị khóa.',
                  layout: false,
                });
            }
              if (nhanVien.active) {
                  const { password, ...nhanVienData } = nhanVien.toObject();
                  
                  // Kiểm tra nếu mật khẩu và tên người dùng trùng nhau
                  if (uname === psw) {
                      // Nhắc nhở người dùng đổi mật khẩu
                      return res.render('login', {
                          us: uname,
                          msg: 'Vui lòng đổi mật khẩu để bảo mật tài khoản.',
                          layout: false,
                          showModal: true, // Đảm bảo modal hiện lên
                          shouldRedirect: true // Thêm cờ để xác định redirect
                      });
                  } else {
                      // Đăng nhập thành công, lưu thông tin vào session
                      req.session.user = {
                          ...nhanVienData,
                          role: nhanVien.role === 'Quản lý' ? 'admin' : 'staff',
                      };
                      return res.redirect('/');
                  }
              } else {
                  // Tài khoản chưa kích hoạt, yêu cầu gửi mã xác thực
                  await usernapi.sendVerifyCode(req, res, nhanVien);
                  return res.render('login', {
                      us: uname,
                      msg: 'Tài khoản chưa được kích hoạt. Vui lòng nhập mã xác thực.',
                      showModal: true,
                      layout: false,
                      shouldRedirect: false
                  });
              }
          } else {
              // Mật khẩu sai
              return res.render('login', {
                  us: uname,
                  msg: 'Sai tài khoản hoặc mật khẩu!',
                  layout: false,
                  showModal: false,
                  shouldRedirect: false
              });
          }
      } else {
          // Tài khoản không tồn tại
          return res.render('login', {
              us: uname,
              msg: 'Sai tài khoản hoặc mật khẩu!',
              layout: false,
              showModal: false,
              shouldRedirect: false
          });
      }
  } catch (err) {
      console.error('Error during login:', err);
      res.status(500).send('Lỗi máy chủ');
  }
});

router.post('/verify-code', async (req, res) => {
    const { code } = req.body;
    const verification = req.session.verification;

    // Kiểm tra xem mã xác thực có tồn tại không
    if (!verification) {
        console.log('Không có mã xác thực trong session.');
        return res.status(400).json({ 
            success: false, 
            msg: 'Mã xác thực đã hết hạn. Vui lòng nhấn Gửi lại mã.' 
        });
    }

    const { username, code: savedCode, expiresAt } = verification;

    // Kiểm tra thời gian hết hạn
    if (Date.now() > expiresAt) {
        console.log('Mã xác thực đã hết hạn.');
        req.session.verification = null; // Xóa mã khỏi session
        return res.status(400).json({ 
            success: false, 
            msg: 'Mã xác thực đã hết hạn. Vui lòng nhấn Gửi lại mã.' 
        });
    }

    console.log('Mã người dùng nhập:', code);
    console.log('Mã đã lưu:', savedCode);

    // Kiểm tra mã xác thực
    if (code == savedCode) {
        console.log('Mã xác thực đúng.');
        // Kích hoạt tài khoản
        await NhanVien.updateOne({ username }, { active: true });
        req.session.verification = null; // Xóa mã khỏi session
        return res.json({ success: true, msg: 'Tài khoản đã được kích hoạt.' });
    } else {
        console.log('Mã xác thực không chính xác.');
        res.json({ success: false, msg: 'Mã xác thực không chính xác.' });
    }
});


router.post('/resend-code', async (req, res) => {
    if (!req.session.verification) {
        return res.status(400).json({ success: false, msg: "Không có người dùng cần gửi mã." });
    }

    const { username } = req.session.verification;

    const nhanVien = await NhanVien.findOne({ username });

    if (!nhanVien) {
        return res.status(404).json({ success: false, msg: "Không tìm thấy nhân viên." });
    }

    await usernapi.sendVerifyCode(req, res, nhanVien);
    res.json({ success: true, msg: "Mã xác thực đã được gửi lại." });
});



module.exports = router;
