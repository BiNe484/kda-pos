const mongoose = require('mongoose');

const KhuyenMaiSchema = new Schema({
    voucher_ID: {
        type: String,
        required: true,
        unique: true
    },
    tenKhuyenMai: {
        type: String,
        required: true
    },
    giamGia: {
        type: Number
    },
    loaiKhuyenMai: {
        type: String,
        enum: ['Phần trăm', 'số tiền', 'combo'],
    },
    ngayBatDau: {
        type: Date,
        required: true
    },
    ngayKetThuc: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean
    },
    conditions: {
        type: String
    }
}, { collection: 'KhuyenMais' });

// Tạo model KhuyenMai
module.exports  = mongoose.model('KhuyenMai', KhuyenMaiSchema);
