const mongoose = require('mongoose');

const nguyenLieuSchema = new mongoose.Schema({
    id_NL: {type: String, required: true},
    tenNguyenLieu: {type: String, required: true},
    tonKho: {type: Number, required: false},
    donVi: {type: String, required: false},
    HSD: {type: Date, required: false}
}, { collection: 'NguyenLieus' });

module.exports = mongoose.model('NguyenLieu', nguyenLieuSchema);


