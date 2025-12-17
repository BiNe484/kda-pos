var express = require('express');
var router = express.Router();
const SanPham = require('../models/SanPham');

/* GET menu listing with paginated SanPham data. */
router.get('/', userapi.isLogin, async (req, res, next ) => {
  const page = parseInt(req.query.page) || 1; 
  const limit = 6; 
  const skip = (page - 1) * limit;

  try {
   
    const totalProducts = await SanPham.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit); 

    const sanPhams = await SanPham.find().skip(skip).limit(limit);

    console.log('Danh sách sản phẩm:', JSON.stringify(sanPhams, null, 2));

    
    res.render('menu', {
      title: 'Menu',
      sanPhams: sanPhams,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Có lỗi xảy ra:', error);
    res.render('error', { message: 'Có lỗi xảy ra khi lấy danh sách sản phẩm.', layout: false });
  }
});

router.get('/details/:id', userapi.isLogin, async(req, res) => {
  try {
    const sanPham = await SanPham.findById(req.params.id);
    if (!sanPham) {
      return res.status(404).render('error', { message: 'Sản phẩm không tồn tại.', layout: false });
    }

    res.render('details', { 
      title: 'Chi tiết sản phẩm', 
      sanPham: sanPham
    });

  } catch (error) {
    console.error('Có lỗi', error);
    res.render('error', { message: 'Có lỗi khi lấy chi tiết sản phẩm', layout: false });
  }
});

module.exports = router;
