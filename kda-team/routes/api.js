const express = require('express');
const router = express.Router();
const moment = require('moment');
const HoaDon = require('../models/HoaDon');
const KhachHang = require('../models/KhachHang');
const NguyenLieu = require('../models/NguyenLieu');
const SanPham = require('../models/SanPham');
const NhanVien = require('../models/NhanVien');

//Đơn hàng theo năm (xét từng tháng) mặc định là năm hiện tại
router.get('/orders/monthly', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear(); // Lấy năm hiện tại

        const monthlyOrdersAndRevenue = await HoaDon.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $year: "$ngayMua" }, currentYear]
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$ngayMua" },
                    totalOrders: { $sum: 1 }, // Đếm số đơn hàng
                    totalRevenue: { $sum: "$tongTien" } // Tính tổng doanh thu
                }
            },
            { $sort: { "_id": 1 } } // Sắp xếp theo thứ tự tháng
        ]);

        // Chuẩn hóa kết quả thành mảng 12 phần tử
        const ordersAndRevenuePerMonth = Array(12).fill(0).map(() => ({
            totalOrders: 0,
            totalRevenue: 0
        }));

        monthlyOrdersAndRevenue.forEach(({ _id, totalOrders, totalRevenue }) => {
            ordersAndRevenuePerMonth[_id - 1] = {
                totalOrders: totalOrders,
                totalRevenue: totalRevenue
            };
        });

        // Trả về dữ liệu dạng JSON
        res.json(ordersAndRevenuePerMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});


// Route để lấy số lượng đơn hàng theo ngày
router.get('/orders/daily', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

        // Đếm số lượng đơn hàng trong ngày
        const ordersDailyCount = await HoaDon.countDocuments({
            ngayMua: {
                $gte: today 
            }
        });

        // Tính tổng doanh thu trong ngày
        const totalRevenue = await HoaDon.aggregate([
            {
                $match: {
                    ngayMua: {
                        $gte: today // Chọn các đơn hàng có ngày mua từ đầu ngày hôm nay
                    }
                }
            },
            {
                $group: {
                    _id: null, // Không cần nhóm theo trường nào
                    total: { $sum: "$tongTien" } // Tính tổng giá trị của trường tongTien
                }
            }
        ]);

        // Nếu không có đơn hàng nào, totalRevenue sẽ là một mảng rỗng
        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Trả về cả số lượng đơn hàng và tổng doanh thu
        res.json({ ordersDaily: ordersDailyCount, revenue: revenue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

//Khách hàng mới theo năm (xét từng tháng) mặc định là năm hiện tại
router.get('/customers/monthly', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear(); // Lấy năm hiện tại

        const monthlyCustomers = await KhachHang.aggregate([
            {
                $match: {
                    $expr: {
                        $eq: [{ $year: "$ngayThem" }, currentYear]
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$ngayThem" },
                    totalCustomers: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Chuyển đổi dữ liệu thành mảng có 12 phần tử
        const customersPerMonth = Array(12).fill(0);
        monthlyCustomers.forEach(customer => {
            customersPerMonth[customer._id - 1] = customer.totalCustomers;
        });

        // Trả về dữ liệu dạng JSON
        res.json(customersPerMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});


// Route để lấy số lượng khách mới trong ngày hôm nay
router.get('/customers/new', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00

        const newCustomersCount = await KhachHang.countDocuments({
            ngayThem: {
                $gte: today // Tìm những khách hàng có ngayThem từ đầu ngày hôm nay
            }
        });

        res.json({ newCustomers: newCustomersCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

// Route để lấy nguyên liệu hiện có
router.get('/ingredients', async (req, res) => {
    try {
        // Tìm tất cả nguyên liệu trong cơ sở dữ liệu
        const ingredients = await NguyenLieu.find();

        // Kiểm tra nếu không có nguyên liệu nào
        if (!ingredients || ingredients.length === 0) {
            return res.status(404).json({ message: 'Không có nguyên liệu nào.' });
        }

        // Trả về danh sách nguyên liệu
        res.status(200).json(ingredients);
    } catch (error) {
        console.error('Lỗi khi lấy nguyên liệu:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy nguyên liệu.' });
    }
});

// Route để lấy thông tin chi tiết sản phẩm
router.get('/products/:productId', async (req, res) => {
    try {
        // Lấy ID của sản phẩm từ params
        const { productId } = req.params;

        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await SanPham.findOne({id_SP: productId});

        // Kiểm tra nếu không tìm thấy sản phẩm
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        // Trả về thông tin chi tiết sản phẩm
        res.status(200).json(product);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết sản phẩm.' });
    }
});

// Route để lấy thông tin chi tiết nhân viên
router.get('/employees/:employeeId', async (req, res) => {
    try {
        // Lấy ID của nhân viên từ params
        const { employeeId } = req.params;

        // Tìm nhân viêntrong cơ sở dữ liệu
        const employee = await NhanVien.findOne({id_NV: employeeId});

        // Kiểm tra nếu không tìm thấy sản phẩm
        if (!employee) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
        }

        // Trả về thông tin chi tiết nhân viên
        res.status(200).json(employee);
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết nhân viên:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy chi tiết nhân viên.' });
    }
});

router.post("/revenue/:button", async (req, res) => {
    try {
        const { button } = req.params;
        const { startDate: bodyStart, endDate: bodyEnd } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
        let startDate, endDate, groupBy, resultArray;

        if (button === "customDuration") {
            // Lấy startDate và endDate từ body
            if (!bodyStart || !bodyEnd) {
                return res.status(400).json({ message: "Thiếu startDate hoặc endDate" });
            }
            startDate = new Date(bodyStart);
            endDate = new Date(bodyEnd);
            endDate.setHours(23, 59, 59, 999); // Đặt giờ cuối ngày
            groupBy = {
                $dateToString: { format: "%Y-%m-%d", date: "$ngayMua" }
            };
            const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
            resultArray = Array(days).fill(0); // Mảng số ngày
        } else {
            // Phần xử lý các button khác giữ nguyên
            switch (button) {
                case "btnToday":
                    startDate = new Date(today);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = { $hour: "$ngayMua" };
                    resultArray = Array(24).fill(0); // Mảng 24 phần tử cho 24 giờ
                    break;

                case "btnYesterday":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setDate(today.getDate() - 1);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = { $hour: "$ngayMua" };
                    resultArray = Array(24).fill(0); // Mảng 24 phần tử cho 24 giờ
                    break;

                case "btn7Days":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = {
                        $dateToString: { format: "%Y-%m-%d", date: "$ngayMua" }
                    };
                    resultArray = Array(7).fill(0);
                    break;

                case "btn30Days":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 29);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = {
                        $dateToString: { format: "%Y-%m-%d", date: "$ngayMua" }
                    };
                    resultArray = Array(30).fill(0);
                    break;

                default:
                    return res.status(400).json({ message: "Button không hợp lệ" });
            }
        }

        const revenueData = await HoaDon.aggregate([
            {
                $match: {
                    ngayMua: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $addFields: {
                    ngayMuaVietNam: {
                        $dateAdd: {
                            startDate: "$ngayMua",
                            unit: "hour",
                            amount: 7
                        }
                    }
                }
            },
            {
                $group: {
                    _id: button === "btnToday" || button === "btnYesterday"
                        ? { $hour: "$ngayMuaVietNam" }
                        : {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$ngayMuaVietNam"
                            }
                        },
                    total: { $sum: "$tongTien" }
                }
            }
        ]);

        revenueData.forEach((item) => {
            if (button === "btnToday" || button === "btnYesterday") {
                const hour = item._id;
                resultArray[hour] = item.total;
            } else {
                const dateIndex = Math.floor(
                    (new Date(item._id) - startDate) / (24 * 60 * 60 * 1000)
                );
                if (dateIndex >= 0 && dateIndex < resultArray.length) {
                    resultArray[dateIndex] = item.total;
                }
            }
        });

        res.json(resultArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});


//Lấy số đơn hàng cho biểu đồ
router.post("/orders/:button", async (req, res) => {
    try {
        const { button } = req.params;
        const { startDate: bodyStart, endDate: bodyEnd } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
        let startDate, endDate, groupBy, resultArray;

        if (button === "customDuration") {
            // Lấy startDate và endDate từ body
            if (!bodyStart || !bodyEnd) {
                return res.status(400).json({ message: "Thiếu startDate hoặc endDate" });
            }
            startDate = new Date(bodyStart);
            endDate = new Date(bodyEnd);
            endDate.setHours(23, 59, 59, 999); // Đặt giờ cuối ngày
            const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000)); // Tính số ngày
            resultArray = Array(days).fill(0); // Mảng số ngày
            groupBy = {
                $dateToString: { format: "%Y-%m-%d", date: "$ngayMua" }
            };
        } else {
            // Xử lý các trường hợp button khác như btnToday, btnYesterday...
            switch (button) {
                case "btnToday":
                    startDate = new Date(today);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = { $hour: "$ngayMua" };
                    resultArray = Array(24).fill(0); // Mảng 24 phần tử cho 24 giờ
                    break;

                case "btnYesterday":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setDate(today.getDate() - 1);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = { $hour: "$ngayMua" };
                    resultArray = Array(24).fill(0); // Mảng 24 phần tử cho 24 giờ
                    break;

                case "btn7Days":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6); // Bao gồm ngày hôm nay
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = {
                        $dateToString: { format: "%Y-%m-%d", date: "$ngayMua" }
                    };
                    resultArray = Array(7).fill(0); // Mảng 7 phần tử cho 7 ngày
                    break;

                case "btn30Days":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 29); // Bao gồm ngày hôm nay
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = {
                        $dateToString: { format: "%Y-%m-%d", date: "$ngayMua" }
                    };
                    resultArray = Array(30).fill(0); // Mảng 30 phần tử cho 30 ngày
                    break;

                default:
                    return res.status(400).json({ message: "Button không hợp lệ" });
            }
        }

        // Thực hiện truy vấn với MongoDB
        const orderData = await HoaDon.aggregate([
            {
                $match: {
                    ngayMua: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $addFields: {
                    ngayMuaVietNam: {
                        $dateAdd: {
                            startDate: "$ngayMua", // Thời gian gốc trong DB
                            unit: "hour",
                            amount: 7 // Thêm 7 giờ để chuyển sang giờ Việt Nam
                        }
                    }
                }
            },
            {
                $group: {
                    _id: button === "btnToday" || button === "btnYesterday"
                        ? { $hour: "$ngayMuaVietNam" } // Gộp theo giờ
                        : {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$ngayMuaVietNam" // Gộp theo ngày
                            }
                        },
                    totalOrders: { $sum: 1 } // Đếm số lượng đơn hàng
                }
            }
        ]);

        // Điền dữ liệu vào mảng kết quả
        orderData.forEach((item) => {
            if (button === "btnToday" || button === "btnYesterday") {
                // _id là giờ (0-23)
                const hour = item._id;
                resultArray[hour] = item.totalOrders;
            } else {
                // _id là ngày (yyyy-MM-dd)
                const dateIndex = Math.floor(
                    (new Date(item._id) - startDate) / (24 * 60 * 60 * 1000)
                );
                if (dateIndex >= 0 && dateIndex < resultArray.length) {
                    resultArray[dateIndex] = item.totalOrders;
                }
            }
        });

        res.json(resultArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

//Lấy số khách hàng mới cho biểu đồ
router.post("/customers/:button", async (req, res) => {
    try {
        const { button } = req.params;
        const { startDate: bodyStart, endDate: bodyEnd } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
        let startDate, endDate, groupBy, resultArray;

        if (button === "customDuration") {
            // Lấy startDate và endDate từ body
            if (!bodyStart || !bodyEnd) {
                return res.status(400).json({ message: "Thiếu startDate hoặc endDate" });
            }
            startDate = new Date(bodyStart);
            endDate = new Date(bodyEnd);
            endDate.setHours(23, 59, 59, 999); // Đặt giờ cuối ngày
            groupBy = {
                $dateToString: { format: "%Y-%m-%d", date: "$ngayThem" }
            };
            const days = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
            resultArray = Array(days).fill(0); // Mảng số ngày
        } else {
            // Phần xử lý các button khác giữ nguyên
            switch (button) {
                case "btnToday":
                    startDate = new Date(today);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = { $hour: "$ngayThem" };
                    resultArray = Array(24).fill(0); // Mảng 24 phần tử cho 24 giờ
                    break;

                case "btnYesterday":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setDate(today.getDate() - 1);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = { $hour: "$ngayThem" };
                    resultArray = Array(24).fill(0); // Mảng 24 phần tử cho 24 giờ
                    break;

                case "btn7Days":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 6);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = {
                        $dateToString: { format: "%Y-%m-%d", date: "$ngayThem" }
                    };
                    resultArray = Array(7).fill(0);
                    break;

                case "btn30Days":
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 29);
                    startDate.setHours(0, 0, 0, 0);
                    endDate = new Date(today);
                    endDate.setHours(23, 59, 59, 999);
                    groupBy = {
                        $dateToString: { format: "%Y-%m-%d", date: "$ngayThem" }
                    };
                    resultArray = Array(30).fill(0);
                    break;

                default:
                    return res.status(400).json({ message: "Button không hợp lệ" });
            }
        }

        // Truy vấn MongoDB với aggregate
        const customerData = await KhachHang.aggregate([
            {
                $match: {
                    ngayThem: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $addFields: {
                    ngayThemVietNam: {
                        $dateAdd: {
                            startDate: "$ngayThem", // Thời gian gốc trong DB
                            unit: "hour",
                            amount: 7 // Thêm 7 giờ để chuyển sang giờ Việt Nam
                        }
                    }
                }
            },
            {
                $group: {
                    _id: button === "btnToday" || button === "btnYesterday"
                        ? { $hour: "$ngayThemVietNam" }
                        : {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$ngayThemVietNam"
                            }
                        },
                    count: { $sum: 1 } // Đếm tổng số khách hàng
                }
            }
        ]);

        // Điền dữ liệu vào mảng kết quả
        customerData.forEach((item) => {
            if (button === "btnToday" || button === "btnYesterday") {
                const hour = item._id;
                resultArray[hour] = item.count;
            } else {
                const dateIndex = Math.floor(
                    (new Date(item._id) - startDate) / (24 * 60 * 60 * 1000)
                );
                if (dateIndex >= 0 && dateIndex < resultArray.length) {
                    resultArray[dateIndex] = item.count;
                }
            }
        });

        // Trả về kết quả dưới dạng JSON
        res.json(resultArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
});

module.exports = router;