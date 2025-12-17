const mailApi = require('./mailApi');
// đã đăng nhập hay chưa
function checkLogin(req, res, next) {
    if (req.session.user) {
      return next(); // đã đăng nhập, tiếp tục
    }
    res.redirect('/login'); // chuyển hướng tới trang đăng nhập nếu chưa đăng nhập
  }
userapi = {
    isLogin: checkLogin,
    sendVerifyCode: async (req, res, nhanVien) => {
      try {
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
        // Gửi email với mã xác thực
        const emailResponse = await mailApi.sendMail({
          to: nhanVien.email,
          subject: 'Mã xác thực',
          html: `
            <html>
            <body>
              <h2>Chào mừng ${nhanVien.tenNhanVien}!</h2>
              <p>Mã xác thực của bạn là: <strong>${verificationCode}</strong></p>
            </body>
            </html>
          `,
        });
    
        if (emailResponse.success) {
    
          /// Lưu mã xác thực và thời gian hết hạn vào session
          const expirationTime = Date.now() +  60 * 1000; // 1 phút
          req.session.verification = {
            code: verificationCode,
            username: nhanVien.username,
            expiresAt: expirationTime,
          };
          console.log('Email sent successfully with code:', verificationCode);
          console.log('Thời gian hết hạn: ', expirationTime);
          // Xóa mã xác thực sau 1 phút
          setTimeout(() => {
            if (req.session.verification && Date.now() >= req.session.verification.expiresAt) {
              console.log('Verification code expired.');
              req.session.verification = null;
            }
          }, 2 * 60 * 1000);
        } else {
          console.error('Failed to send email:', emailResponse.error);
          res.status(500).send('Không thể gửi email.');
        }
      } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Có lỗi xảy ra.');
      }
    }
    
};

module.exports = userapi