const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct, updateProduct, getProductById } = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('imagen'), createProduct);       
router.put('/:id', upload.single('imagen'), updateProduct);     
router.delete('/:id', deleteProduct);

module.exports = router;
