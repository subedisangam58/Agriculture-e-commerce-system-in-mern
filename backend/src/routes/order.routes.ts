import express from 'express';
import {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrdersByUser,
    updateOrderStatus,
    deleteOrder,
    getOrdersByMe
} from '../controllers/order.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/createorder', verifyToken, createOrder);
router.get('/', verifyToken, getAllOrders);
router.get('/:id', verifyToken, getOrderById);
router.get('/user/me', verifyToken, getOrdersByMe);
router.get('/user/:userId', verifyToken, getOrdersByUser);
router.put('/:id/status', verifyToken, updateOrderStatus);
router.delete('/:id', verifyToken, deleteOrder);

export default router;