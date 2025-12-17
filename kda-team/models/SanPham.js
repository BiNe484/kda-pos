const mongoose  = require ("mongoose");

const sizeSchema = new mongoose.Schema({
    id_size: String,
    kichCo: String,
    gia: Number
  },
  { _id: false } // Tắt tự động tạo _id
);
  
  const nguyenLieuSchema = new mongoose.Schema({
    id_NL: String,
    tenNguyenLieu: String,
    dinhLuong: Number,
    donVi: String
  },
  { _id: false } // Tắt tự động tạo _id
);
  
  const SanPhamSchema = new mongoose.Schema({
    id_SP: String,
    hinhSanPham: String,
    tenSanPham: String,
    loaiSanPham: String,
    giaBan: Number,
    soLuongTon: Number,
    size: [sizeSchema],
    nguyenLieuCheBien: [nguyenLieuSchema]
  }, { collection: 'SanPhams' }); // Chỉ định tên collection
  
  module.exports = mongoose.model('SanPham', SanPhamSchema);