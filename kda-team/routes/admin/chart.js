const fs = require('fs');
var express = require('express');
const multer = require('multer');
var router = express.Router();
const path = require('path');
const adminapi = require('../../API/adminapi');
const SanPham = require('../../models/SanPham');

// Route để hiển thị biểu đồ
router.get('/', adminapi.isAdmin, async (req, res) => {
    res.render('admin-chart', { layout: 'layout/admin-layout', title: 'Thống kê' }); 
});


module.exports = router;
