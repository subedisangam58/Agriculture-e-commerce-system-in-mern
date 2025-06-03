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
import { protect } from '../middlewares/protect';

const router = express.Router();

// Create a new order (Authenticated users only)
router.post('/createorder', protect, createOrder);

// Get all orders (Admin or system-level only – extend logic inside controller or middleware)
router.get('/', protect, getAllOrders);

// Get a single order by ID
router.get('/:id', protect, getOrderById);

router.get('/user/me', protect, getOrdersByMe);

// Get all orders for a specific user (if logged-in user matches the ID or is admin)
router.get('/user/:userId', protect, getOrdersByUser);

// Update order status (e.g., to 'Shipped', 'Delivered', etc.)
router.put('/:id/status', protect, updateOrderStatus);

// Delete an order (optional – admin or owner logic should be inside controller)
router.delete('/:id', protect, deleteOrder);

export default router;
