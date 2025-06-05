import express from 'express';
import multer from 'multer';
import {
    addProduct,
    getProducts,
    getProductById,
    getProductsByCategory,
    updateProduct,
    deleteProduct,
    getTopSellingProducts,
    getMostViewedProducts,
    searchProductsByVector
} from '../controllers/product.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
});

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/top-selling', getTopSellingProducts);
router.get('/most-viewed', getMostViewedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/semantic-search', searchProductsByVector);
router.get('/:id', getProductById);

// Protected routes
router.post('/', verifyToken, upload.single('image'), addProduct);
router.put('/:id', verifyToken, upload.single('image'), updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

export default router;