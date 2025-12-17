const nodemailer = require('nodemailer');

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'duyenman19@gmail.com',
    pass: 'sdvz osao ydiw okxk'
  }
});

// Tạo hàm gửi email
const sendMail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: 'duyenman19@gmail.com',
      to, // Email người nhận
      subject, // Chủ đề
      html,
    };

    // Gửi email
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    // Trả về thông tin thành công
    return { success: true, info: info.response };
  } catch (error) {
    console.error('Error sending email:', error);
    // Trả về lỗi nếu có
    return { success: false, error };
  }
};

module.exports = { sendMail };
