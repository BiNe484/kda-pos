
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nhanVienSchema = new Schema({
  id_NV: { type: String, required: true },
  tenNhanVien: { type: String, required: true },
  sdt: { type: String, required: true },
  cccd: { type: String, required: true },
  email: { type: String, required: true },
  loaiNhanVien: { type: String, required: true },
  diaChi: { type: String, required: true },
  active: { type: Boolean, default: true },
  username: {type: String, default: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  hinhNhanVien :{type:String, require:true},
  khoa:{type:Boolean, default:true},
}, { collection: 'NhanViens' }); // Chỉ định tên collection

module.exports = mongoose.model('NhanVien', nhanVienSchema);
