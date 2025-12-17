var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');
var logger = require('morgan');
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const NhanVien = require('./models/NhanVien'); 

// Kết nối đến MongoDB
mongoose.connect('mongodb://localhost:27017/mydb')
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

var app = express();

// Đăng ký các helpers
const helpers = {
  getUsername: (email) => {
    return email ? email.split('@')[0] : '';
  },
  isAdmin: (user) => {
    return user && user.role == 'admin';
  },
  commaSeparated: (items, options)=>{
    if (!Array.isArray(items)) return '';
    return items.map((item, index) => {
        // Sử dụng options.fn(item) để render nội dung trong mỗi phần tử
        const content = options.fn(item);
        return index < items.length - 1 ? `${content},` : content;
    }).join(' ');
  },
  getFileName: (inputString) =>{
    if (typeof inputString !== 'string') {
      return '';
    }
    const segments = inputString.split('/');
    return segments[segments.length - 1];
  },
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
  le: (a, b) => a <= b,
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  range: (n) => Array.from({ length: n }, (_, k) => k + 1),
  
  getFirstSizePrice: function (sizes) {
    return sizes && sizes.length > 0 ? sizes[0].price : 0;
  },
  json: function(context) {
    return JSON.stringify(context);
  },
  toFixed: function(value, decimals) {
    return value.toFixed(decimals);
  },
  eq: function(a, b) {
    return a === b;
  },
  paginationRange: function(currentPage, totalPages, range){
    const pages = [];
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, currentPage + range);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
};

// Thiết lập hbs với các tùy chọn layout, partials và helpers
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: helpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Cho phép truy cập thuộc tính prototype
    allowProtoMethodsByDefault: true // Cho phép gọi các phương thức prototype
  }
}));

// Thiết lập view engine
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Đảm bảo khai báo cookieParser trước session middleware
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'mykey', // Thay đổi thành một secret an toàn hơn trong production
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user; // Làm dữ liệu user có sẵn cho views
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

// Các router
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var loginRouter = require('./routes/login');
var menuRouter = require('./routes/menu');
var orderRouter = require('./routes/order');
var customerRouter = require('./routes/customer');
var apiRouter = require('./routes/api');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/login', loginRouter);
app.use('/menu', menuRouter);
app.use('/order', orderRouter);
app.use('/customer', customerRouter);
app.use('/api', apiRouter);

app.get('/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const email = req.session.user.email;
    const nhanVienInfo = await NhanVien.findOne({ email });

    if (nhanVienInfo) {
      const layout = nhanVienInfo.role === 'Nhân viên' 
        ? 'layout' 
        : 'layout/admin-layout';

      res.render('profile', { 
        layout,
        title: 'Thông tin Nhân viên', 
        adminInfo: nhanVienInfo 
      });
    } else {
      res.status(404).render('error', { message: 'Không tìm thấy thông tin nhân viên.' });
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhân viên:', error);
    res.status(500).render('error', { message: 'Có lỗi xảy ra khi lấy thông tin nhân viên.' });
  }
});


// Đăng xuất
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.render('error');
    }
    res.redirect('/'); 
  });
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
