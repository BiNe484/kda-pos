var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const adminapi = require('../../API/adminapi');
const NhanVien = require('../../models/NhanVien');

// Route hiển thị danh sách nhân viên
router.get('/', adminapi.isAdmin, async (req, res) => {
    try {
        const nhanViens = await NhanVien.find();
        res.render('admin-employees', { layout: 'layout/admin-layout', title: 'Nhân viên', nhanViens });
    } catch (error) {
        console.error(error);
        res.render('error', { message: 'Có lỗi xảy ra khi lấy danh sách nhân viên.' });
    }
});

// Route thêm nhân viên
router.post('/add', async (req, res) => {
    const { tenNhanVien, diaChi, cccd, sdt, email, loaiNhanVien, role } = req.body;

    if (!tenNhanVien || !diaChi || !cccd || !sdt || !email || !loaiNhanVien || !role) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }

    try {
        const existingEmployee = await NhanVien.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Email đã tồn tại.' });
        }
        const existingCccd = await NhanVien.findOne({ cccd });
        if (existingCccd) {
            return res.status(400).json({ message: 'CCCD đã tồn tại.' });
        }
        const existingSdt = await NhanVien.findOne({ sdt });
        if (existingSdt) {
            return res.status(400).json({ message: 'Số điện thoại đã tồn tại.' });
        }
        const count = await NhanVien.countDocuments();
        const id_NV = `NV${(count + 1).toString().padStart(3, '0')}`;
        const username = email.split('@')[0];
        const hashedPassword = await bcrypt.hash(username, 10);

        const newEmployee = new NhanVien({
            id_NV,
            tenNhanVien,
            loaiNhanVien,
            cccd,
            sdt,
            email,
            diaChi,
            role,
            username,
            password: hashedPassword,
            active: false,
            khoa:false,
        });

        await newEmployee.save();
        adminapi.sendEmailToNewEmployee(newEmployee);
        res.json({ message: 'Thêm nhân viên thành công', id_NV });
    } catch (error) {
        console.error('Lỗi khi thêm nhân viên:', error);
        res.status(500).json({ message: 'Lỗi khi thêm nhân viên', error: error.message });
    }
});

// Route xóa nhân viên
router.delete('/delete/:id', async (req, res) => {
    try {
        const NV_ID = req.params.id;
        const employee = await NhanVien.findOne({ id_NV: NV_ID });

        if (!employee) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
        }

        await NhanVien.findOneAndDelete({ id_NV: NV_ID });
        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        res.status(500).json({ message: 'Lỗi khi xóa nhân viên.' });
    }
});

  
router.put('/edit/:employeeId', async (req, res) => {
    const { employeeId } = req.params;
    const updateData = req.body;

    console.log('Employee ID:', employeeId);
    console.log('Update Data:', updateData);

    try {
        const existingEmployee = await NhanVien.findOne({ id_NV: employeeId });
        
        if (!existingEmployee) {
            console.error('Không tìm thấy nhân viên:', employeeId);
            return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật' });
        }

        updateData.tenNhanVien = req.body.tenNhanVien;
        
        // Kiểm tra nếu có ảnh mới thì cập nhật, nếu không giữ nguyên hình ảnh cũ
        updateData.email = req.body.email;

        updateData.cccd = req.body.cccd;
        updateData.sdt = req.body.sdt;
        updateData.diaChi = req.body.diaChi;
        updateData.khoa = req.body.khoa;
       

        // Update only the fields provided
        const updatedEmployee = await NhanVien.findOneAndUpdate(
            { id_NV: employeeId }, // Điều kiện tìm kiếm
            { // Dữ liệu cập nhật
                tenNhanVien: req.body.tenNhanVien,
                email: req.body.email,
                cccd: req.body.cccd,
                sdt: req.body.sdt,
                diaChi: req.body.diaChi,
                khoa:req.body.khoa
            },
            { new: true },
          // Trả về document đã cập nhật
        );
        

        console.log('Updated Employee:', updatedEmployee);

        res.json({ message: 'Cập nhật nhân viên thành công', updatedEmployee });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật nhân viên' });
    }
});

  
module.exports = router;
