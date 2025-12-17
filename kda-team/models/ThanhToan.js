const mongoose = require("mongoose");

const ThanhToanSchema = new mongoose.Schema({
    thanhToan:[{
        id_DH:String,
        sdt:String
    }],
    khuyenMai:[
        {
            maKhuyenMai:String,
            loaiKhuyenMai:String, // nếu như mua 1 tặng 1 
            giaGiam:Number // nếu giảm theo phần trăm
        }
    ],

    diemTichLuy:Number,
    hinhThucThanhToan:String

})

module.exports= mongoose.model('ThanhToan', ThanhToanSchema);