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
import { protect } from '../middlewares/protect';

// Configure multer for image uploads
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/top-selling', getTopSellingProducts);
router.get('/most-viewed', getMostViewedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/semantic-search', searchProductsByVector); // Local vector search
router.get('/:id', getProductById);

// Protected routes
router.post('/addproduct', protect, upload.single('image'), addProduct);
router.put('/:id', protect, upload.single('image'), updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;
