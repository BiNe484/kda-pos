const mongoose = require("mongoose");

const NhapHangSchema = new mongoose.Schema({
    id_NH: String,
    NhapKho: [
      {
        id_NL: String,
        ten_NL: String,
        nhaCungCap: String,
        soLuongNhap: Number,
        donVi: String,
        ngayHetHan: Date,
        id_NV: String,
        ngayNhapHang: Date
      }
    ]
  }, {collection: 'NhapHangs'});
  
  module.exports = mongoose.model('NhapHang', NhapHangSchema);