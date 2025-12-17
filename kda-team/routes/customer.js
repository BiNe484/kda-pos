const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const unidecode = require('unidecode');
const adminapi = require('../API/adminapi');
const KhachHang = require('../models/KhachHang');
const HoaDon = require('../models/HoaDon');
const SanPham = require('../models/SanPham');

router.post('/check', async (req, res) => {
  try {
    const { phoneNumber } = req.body;  // Lấy số điện thoại từ body

    // Kiểm tra xem khách hàng có tồn tại trong cơ sở dữ liệu không
    const customer = await KhachHang.findOne({ sdt: phoneNumber })
      .populate({
        path: 'giaoDich',
        populate: [
          {
            path: 'sanPhams.sanPham',
            model: 'SanPham',
          },
          {
            path: 'nhanVien',
            select: 'id_NV tenNhanVien', 
          },
        ],
      });

    if (!customer) {
      return res.status(404).json({
        message: 'Khách hàng không tồn tại',
        status: 'not_found',
      });
    }

    // Sắp xếp giao dịch theo ngày tạo mới nhất
    customer.giaoDich.sort((a, b) => new Date(b.ngayMua) - new Date(a.ngayMua));

    // Tính toán giá tổng của từng sản phẩm trong mỗi hóa đơn
    customer.giaoDich.forEach(hoaDon => {
      hoaDon.sanPhams.forEach(item => {
        item.totalPrice = item.gia * item.soLuong;
      });
    });

    // Trả về thông tin khách hàng và tất cả lịch sử giao dịch
    res.status(200).json({
      customerInfo: {
        sdt: customer.sdt,
        hoTen: customer.hoTen,
        hangThanhVien: customer.hangThanhVien,
        diemTichLuy: customer.diemTichLuy,
        hinhThucThanhToan: customer.hinhThucThanhToan,
        giaoDich: customer.giaoDich.length,
        ngayThem: customer.ngayThem,
      },
      giaoDich: customer.giaoDich.map(hoaDon => hoaDon.toJSON()),  // Chuyển giao dịch thành JSON
    });
  } catch (error) {
    console.error('Lỗi khi truy xuất thông tin khách hàng hoặc lịch sử giao dịch:', error);
    res.status(500).send('Đã xảy ra lỗi máy chủ');
  }
});

router.post('/create', async (req, res) => {
  try {
    const { hoTen, sdt } = req.body;

    // Kiểm tra nếu khách hàng đã tồn tại (đảm bảo không trùng số điện thoại)
    const existingCustomer = await KhachHang.findOne({ sdt });

    if (existingCustomer) {
      return res.status(400).json({ message: 'Số điện thoại này đã tồn tại' });
    }

    // Tạo khách hàng mới
    const newCustomer = new KhachHang({
      hoTen,
      sdt,
      diemTichLuy: 0, // Giá trị mặc định
      hangThanhVien: 'Đồng', // Giá trị mặc định
      giaoDich: [], // Giá trị mặc định
    });

    await newCustomer.save();
    res.status(200).json({ message: 'Khách hàng đã được tạo thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau!' });
  }
});

 // Hiển thị chi tiết lịch sử giao dịch
 router.get('/history/:id', userapi.isLogin, async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await HoaDon.findById(id)
      .populate({
        path: 'sanPhams.sanPham',
        select: 'tenSanPham',
      })
      .populate({
        path: 'nhanVien',
        select: 'id_NV tenNhanVien',
      });

    if (!bill) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    res.status(200).json(bill);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
    res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau!' });
  }
});



// Route để tải hóa đơn PDF
router.get('/history/:customerPhone/bill/:billId/pdf', userapi.isLogin, async (req, res) => {
  const { customerPhone, billId } = req.params;

  try {
    // Tìm khách hàng bằng số điện thoại
    const customer = await KhachHang.findOne({ sdt: customerPhone })
      .populate({
        path: 'giaoDich',
        populate: [
          {
            path: 'sanPhams.sanPham',
            model: 'SanPham',
          },
          {
            path: 'nhanVien', 
            model: 'NhanVien',
            select: 'id_NV tenNhanVien', 
          },
        ],
      });

    if (!customer) {
      return res.status(404).send('Customer not found');
    }

    // Lấy hóa đơn tương ứng
    const bill = customer.giaoDich.find(hd => hd._id.toString() === billId);

    if (!bill) {
      return res.status(404).send('Bill not found');
    }

    // Khởi tạo PDF
    const doc = new PDFDocument();

    // Header
    doc.fontSize(24).text('KDA', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Bill ID: ${bill._id}`,50);
    doc.text(`Date: ${bill.ngayMua}`,50);
    doc.text(`Customer Phone: ${customer.sdt}`,50);
    doc.text(`Employee ID: ${bill.nhanVien.id_NV}`,50);
    doc.text(`Employee Name: ${unidecode(bill.nhanVien.tenNhanVien)}`,50);
    doc.text(`Payment Method: ${bill.hinhThucThanhToan}`,50);

    doc.moveDown();

    const tableTop = doc.y;
    const rowHeight = 20;

    // Table Header
    doc.font('Helvetica-Bold')
    .text('Product', 50, tableTop)
    .text('Size', 190, tableTop)
    .text('Price', 270, tableTop)
    .text('Quantity', 350, tableTop)
    .text('Total', 450, tableTop);

    // Vẽ đường viền cho tiêu đề bảng
    doc.rect(50, tableTop - 5, 500, rowHeight).stroke();

    doc.font('Helvetica');

    // Hiển thị danh sách sản phẩm trong hóa đơn
    bill.sanPhams.forEach((item, index) => {
      const productName = unidecode(item.sanPham.tenSanPham || 'Unknown');
      const productSize = item.kichCo || 'Default';
      const productPrice = parseFloat(item.gia);
      const productQuantity = parseInt(item.soLuong) || 0;
      const totalProductPrice = (item.gia * item.soLuong);

      const yPosition = tableTop + rowHeight * (index + 1);

      // Hiển thị dữ liệu từng hàng
      doc.text(productName, 50, yPosition)
        .text(productSize, 190, yPosition)
        .text(`${productPrice}`, 270, yPosition)
        .text(productQuantity, 350, yPosition)
        .text(`${totalProductPrice}`, 450, yPosition);

      // Vẽ đường viền cho từng hàng
      doc.rect(50, yPosition - 5, 500, rowHeight).stroke();
    });

    doc.moveDown(2);

    doc.fontSize(14)
      .text(`T: ${bill.tongTien}`);

    if (bill.hinhThucThanhToan === 'TienMat') {
      doc.fontSize(14).text(`R: ${bill.tienNhan}`);
      doc.fontSize(14).text(`C: ${bill.tienThua}`);
    }
    doc.moveDown(2);
    doc.text('THANK FOR YOUR PURCHASE! HAVE A GREAT DAY!', 130)

    // Trả về PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="bill_${bill._id}.pdf"`
    );

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;