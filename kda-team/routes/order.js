var express = require('express');
var router = express.Router();
const userapi = require('../API/userapi')
const KhachHang = require('../models/KhachHang');
const NhanVien = require('../models/NhanVien');
const HoaDon = require('../models/HoaDon');
const SanPham = require('../models/SanPham');

/* GET home page. */
router.get('/', userapi.isLogin, async function(req, res, next) {
  try {
    const sanPhams = await SanPham.find(); 
    res.render('order', {title: 'Đặt hàng', sanPhams }); 
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Có lỗi xảy ra khi lấy danh sách sản phẩm.' , layout: false});
  }
});

// Xử lý thanh toán và lưu hóa đơn
router.post('/checkout', async (req, res) => {
  const { customerPhone, employeeID, paymentMethod, items, totalAmount, receivedAmount, changeAmount } = req.body;

  try {
    // Lấy thông tin sản phẩm từ items
    const products = await Promise.all(
      items.map(async item => {
        const sanPham = await SanPham.findById(item.productId);
        if (!sanPham) {
          throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại`);
        }

        // Kiểm tra kích cỡ và giá
        const kichCo = item.size || 'Default';
        const gia = sanPham.size.find(size => size.kichCo === kichCo)?.gia || sanPham.giaBan;

        return {
          sanPham: sanPham._id,
          kichCo,
          gia: gia,
          soLuong: item.quantity,
        };
      })
    );

    // Tính tổng tiền từ sản phẩm nếu không khớp với giá trị từ frontend
    const computedTotal = products.reduce((sum, item) => sum + item.gia * item.soLuong, 0);
    if (totalAmount !== computedTotal) {
      return res.status(400).json({ success: false, message: 'Dữ liệu tổng tiền không hợp lệ.' });
    }

    // Tìm kiếm khách hàng theo số điện thoại
    let customer = await KhachHang.findOne({ sdt: customerPhone });
    if (!customer) {
      // Tạo khách hàng mới nếu chưa tồn tại
      customer = new KhachHang({
        sdt: customerPhone,
        hoTen: `${customerPhone} Customer`, // Tên mặc định nếu chưa có
        diemTichLuy: 0,
        hangThanhVien: 'Đồng',
        giaoDich: [],
      });
    }
    let employee = await NhanVien.findOne({ id_NV: employeeID });

    // Tạo hóa đơn mới
    const hoaDon = new HoaDon({
      khachHang: customer._id,
      nhanVien: employee._id,
      sanPhams: products,
      tongTien: computedTotal,
      hinhThucThanhToan: paymentMethod,
      tienNhan: paymentMethod === 'TienMat' ? receivedAmount : computedTotal,
      tienThua: paymentMethod === 'TienMat' ? changeAmount : 0,
    });

    await hoaDon.save();

    // Cập nhật thông tin khách hàng
    customer.diemTichLuy += computedTotal; // Điểm tích lũy = Tổng tiền (đơn giản hóa)
    customer.updateRank(); // Tự động cập nhật cấp bậc
    customer.giaoDich.push(hoaDon._id); // Thêm hóa đơn vào lịch sử giao dịch
    await customer.save();

    // Phản hồi thành công
    res.json({ success: true, message: 'Thanh toán thành công!', hoaDonId: hoaDon._id });
  } catch (error) {
    console.error('Lỗi trong quá trình thanh toán:', error.message);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
  }
});

module.exports = router;
