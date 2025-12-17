const NhanVien = require('../models/NhanVien');
const mailApi = require('./mailApi');
// Kiểm tra quyền admin
function checkAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next(); // Người dùng là admin, tiếp tục
  }
  res.redirect('/'); // Nếu không phải admin, chuyển hướng về trang chính
}

const adminapi = {
  isAdmin: checkAdmin,

  sendEmailToNewEmployee : async (newEmployee) => {
        // Gửi email cho nhân viên mới
        const emailResponse = await mailApi.sendMail({
          to: newEmployee.email,
          subject: 'Chào mừng bạn đến với công ty!',
          html: `
   <html>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #0d6efd;">Chào mừng ${newEmployee.tenNhanVien}!</h2>
        <p>Chúng tôi rất vui được chào đón bạn đến với công ty!</p>
        <p>Dưới đây là thông tin tài khoản của bạn để đăng nhập:</p>
        <ul>
          <li><strong>Tên đăng nhập:</strong> <em>Phần tên email phía trước '@'</em></li>
          <li><strong>Mật khẩu tạm thời:</strong> <em>Trùng với tên đăng nhập</em></li>
        </ul>
        <p>Hãy nhấp vào nút bên dưới để truy cập hệ thống đổi mật khẩu:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="http://localhost:3000/login" 
             style="background-color: #0d6efd; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            Đăng nhập
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với bộ phận nhân sự.</p>
        <p>Trân trọng,<br>Ban Nhân sự</p>
      </div>
    </body>
  </html>
  `
        });
        if (emailResponse.success) {
          console.log('Email sent successfully.');
        } else {
          console.error('Failed to send email:', emailResponse.error);
        }
  }
};

module.exports = adminapi;