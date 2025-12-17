const fs = require('fs');
var express = require('express');
const multer = require('multer');
var router = express.Router();
const path = require('path');
const adminapi = require('../../API/adminapi');
const SanPham = require('../../models/SanPham');

// Route để hiển thị danh sách sản phẩm
router.get('/', adminapi.isAdmin, async (req, res) => {
    try {
        const sanPhams = await SanPham.find(); 
        res.render('admin-products', { layout: 'layout/admin-layout', title: 'Sản phẩm', sanPhams }); 
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Có lỗi xảy ra khi lấy danh sách sản phẩm.', layout: false });
    }
});
// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/products');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Route thêm sản phẩm
router.post('/add', upload.single('hinhSanPham'), async (req, res) => {
    try {
        const { tenSanPham, loaiSanPham, giaBan, soLuongTon, size, nguyenLieuCheBien } = req.body;

        // Lấy số thứ tự hiện tại và tạo id_SP
        const count = await SanPham.countDocuments(); // Đếm tổng số sản phẩm
        const nextNumber = count + 1; // Số thứ tự kế tiếp
        const id_SP = `SP${nextNumber.toString().padStart(3, '0')}`; // Tạo id_SP theo định dạng SPnnn

        // Tạo sản phẩm mới
        const newProduct = new SanPham({
            id_SP, // Thêm id_SP vào
            tenSanPham,
            loaiSanPham,
            giaBan: parseFloat(giaBan),
            soLuongTon: parseInt(soLuongTon),
            hinhSanPham: req.file ? `images/products/${req.file.filename}` : null,
            size: JSON.parse(size || '[]'),
            nguyenLieuCheBien: JSON.parse(nguyenLieuCheBien || '[]')
        });

        await newProduct.save();
        res.json({ message: 'Thêm sản phẩm thành công', id_SP });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi thêm sản phẩm' });
    }
});

// Route xóa sản phẩm
router.delete('/delete/:id', async (req, res) => {
    try {
        const productId = req.params.id; // Lấy ID sản phẩm từ URL
        const product = await SanPham.findOne({ id_SP: productId });

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
        }

        // Xóa file ảnh nếu tồn tại
        if (product.hinhSanPham) {
            const imagePath = path.join(__dirname, '../../public/', product.hinhSanPham);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Lỗi khi xóa ảnh:', err);
                } else {
                    console.log('Đã xóa ảnh:', product.hinhSanPham);
                }
            });
        }

        // Xóa sản phẩm từ database
        await SanPham.findOneAndDelete({ id_SP: productId });

        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm' });
    }
});
  
// Route xử lý cập nhật sản phẩm
router.put('/edit/:productId', upload.single('hinhSanPham'), async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        // Lấy thông tin sản phẩm cũ từ cơ sở dữ liệu để giữ nguyên hình ảnh nếu không có file mới
        const existingProduct = await SanPham.findOne({ id_SP: productId });
        
        if (!existingProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
        }

        // Cập nhật các thuộc tính còn lại
        updateData.tenSanPham = req.body.tenSanPham;
        
        // Kiểm tra nếu có ảnh mới thì cập nhật, nếu không giữ nguyên hình ảnh cũ
        updateData.hinhSanPham = req.file != null? `images/products/${req.file.filename}` : existingProduct.hinhSanPham;

        updateData.loaiSanPham = req.body.loaiSanPham;
        updateData.giaBan = parseFloat(req.body.giaBan);
        updateData.soLuongTon = parseInt(req.body.soLuongTon, 10);
        updateData.size = JSON.parse(req.body.size || '[]');
        updateData.nguyenLieuCheBien = JSON.parse(req.body.nguyenLieu || '[]');

        // Tìm và cập nhật sản phẩm trong cơ sở dữ liệu
        const updatedProduct = await SanPham.findOneAndUpdate({ id_SP: productId }, updateData, { new: true });

        res.json({ message: 'Cập nhật sản phẩm thành công', updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm' });
    }
});


module.exports = router;

