import express from 'express';
import { addToCart, getUserCart, updateCartItem, deleteCartItem } from '../controllers/cart.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/add', verifyToken, addToCart);
router.get('/', verifyToken, getUserCart);
router.patch('/:id', verifyToken, updateCartItem);
router.delete('/:id', verifyToken, deleteCartItem);

export default router;