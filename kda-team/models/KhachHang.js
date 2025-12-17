const mongoose = require('mongoose');

const KhangHangSchema =  new mongoose.Schema({
  sdt: { type: String, required: true, unique: true },
  hoTen: { type: String, required: true},
  diemTichLuy: { type: Number, default: 0 }, // Thêm điểm tích lũy
  hangThanhVien: { type: String, default: 'Đồng' }, // Thêm cấp bậc
  giaoDich: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HoaDon' }],
  ngayThem: { type: Date, default: Date.now },
}, { collection: 'KhachHangs' });

// Hàm tính cấp bậc dựa trên điểm tích lũy
KhangHangSchema.methods.updateRank = function () {
  if (this.diemTichLuy >= 10000000) {
    this.hangThanhVien = 'Kim cương';
  } else if (this.diemTichLuy >= 1000000) {
    this.hangThanhVien = 'Vàng';
  } else if (this.diemTichLuy >= 100000) {
    this.hangThanhVien = 'Bạc';
  } else {
    this.hangThanhVien = 'Đồng';
  }
};

module.exports = mongoose.model('KhachHang', KhangHangSchema);
