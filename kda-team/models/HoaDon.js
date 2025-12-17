const mongoose = require('mongoose');

const hoaDonSchema = new mongoose.Schema({
  khachHang: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KhachHang',
    required: true,
  },
  nhanVien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanVien',
    required: true,
  },
  sanPhams: [{
    sanPham: { type: mongoose.Schema.Types.ObjectId, ref: 'SanPham' },
    kichCo: { type: String, default: 'Default' },
    gia: { type: Number, required: true },
    soLuong: { type: Number, required: true },
  }],
  tongTien: { type: Number, required: true },
  hinhThucThanhToan: { type: String, enum: ['TienMat', 'TheTinDung'], required: true },
  ngayMua: { type: Date, default: Date.now },
  tienNhan: { type: Number, default: 0 },  // Số tiền nhận
  tienThua: { type: Number, default: 0 },    // Số tiền thối lại
}, { collection: 'HoaDons' });

module.exports = mongoose.model('HoaDon', hoaDonSchema);