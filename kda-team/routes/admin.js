var express = require('express');
var router = express.Router();
const adminapi = require('../API/adminapi');
const NhanVien = require('../models/NhanVien'); 
const SanPham = require('../models/SanPham');

var employeesRouter = require('./admin/employees');
var productsRouter = require('./admin/products');
var chartRouter = require('./admin/chart');

router.use('/employees', employeesRouter);
router.use('/products', productsRouter);
router.use('/chart', chartRouter);

// Route cho admin
router.get('/', adminapi.isAdmin, (req, res) => {
    res.render('admin-index', { layout: 'layout/admin-layout', title: 'Trang chủ' });
});

 // Lấy tất cả thông tin liên quan đến admin




module.exports = router;
