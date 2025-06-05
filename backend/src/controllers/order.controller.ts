import { Request, Response } from 'express';
import Order from '../models/order';
import Product from '../models/product';
import Cart from '../models/cart';
import { notifyUser } from '../utils/notifyUser';
import { updateRecommendationsForOrder } from '../utils/recommendationService';
import User from '../models/user';

// Updated interface to match JWT-authenticated requests
interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { products, totalAmount } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            res.status(400).json({ message: 'No products provided' });
            return;
        }

        if (typeof totalAmount !== 'number' || totalAmount < 0) {
            res.status(400).json({ message: 'Invalid total amount' });
            return;
        }

        const enrichedProducts = await Promise.all(
            products.map(async (item: any) => {
                const product = await Product.findById(item.product).select('createdBy');
                if (!product) throw new Error(`Product not found: ${item.product}`);

                return {
                    product: item.product,
                    quantity: item.quantity || 1,
                    farmer: product.createdBy,
                };
            })
        );

        const order = new Order({
            user: req.userId,
            products: enrichedProducts,
            totalAmount,
        });

        await order.save();

        // Update sales count
        const bulkOps = enrichedProducts.map(({ product, quantity }) => ({
            updateOne: {
                filter: { _id: product },
                update: { $inc: { salesCount: quantity } },
            },
        }));
        await Product.bulkWrite(bulkOps);

        // Update recommendations
        const productIds = enrichedProducts.map(p => p.product.toString());
        await updateRecommendationsForOrder(productIds);

        // Clear cart
        await Cart.deleteMany({ user: req.userId });

        await notifyUser({
            userId: req.userId,
            message: 'Your order has been placed successfully.',
            type: 'order',
        });

        res.status(201).json({ success: true, message: 'Order placed successfully', order });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error creating order:', err);
        res.status(500).json({ message: err.message || 'Failed to create order' });
    }
};

export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product');

        res.status(200).json({ success: true, orders });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch orders' });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('products.product');

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        res.status(200).json({ success: true, order });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error fetching order:', err);
        res.status(500).json({ message: err.message || 'Failed to fetch order' });
    }
};

export const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ user: userId }).populate('products.product');

        res.status(200).json({ success: true, orders });

    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ message: err.message || 'Failed to fetch user orders' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        await notifyUser({
            userId: order.user.toString(),
            message: `Your order status was updated to '${status}'.`,
            type: 'order',
        });

        res.status(200).json({ success: true, message: 'Order status updated', order });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error updating order status:', err);
        res.status(500).json({ message: err.message || 'Failed to update order status' });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        await notifyUser({
            userId: order.user.toString(),
            message: 'Your order has been cancelled.',
            type: 'order',
        });

        res.status(200).json({ success: true, message: 'Order deleted successfully' });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error deleting order:', err);
        res.status(500).json({ message: err.message || 'Failed to delete order' });
    }
};

export const getOrdersByMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const orders = await Order.find({ 'products.farmer': req.userId })
            .populate('user', 'name email')
            .populate('products.product');

        res.status(200).json({ success: true, orders });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error fetching farmer orders:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch farmer orders' });
    }
};
