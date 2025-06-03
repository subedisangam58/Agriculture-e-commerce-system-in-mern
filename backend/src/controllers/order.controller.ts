import { Request, Response } from 'express';
import Order from '../models/order';
import { IUser } from '../models/user';
import Cart from '../models/cart';
import { notifyUser } from '../utils/notifyUser';
import Product from '../models/product';
import Recommendation from '../models/recommendation';
import { updateRecommendationsForOrder } from '../utils/recommendationService';

// Extend Express Request to include req.user
interface AuthenticatedRequest extends Request {
    user?: IUser & { _id: string };
}

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const products = req.body.products;
        const totalAmount = req.body.totalAmount;

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
            user: req.user._id,
            products: enrichedProducts,
            totalAmount,
        });

        await order.save();

        // Bulk increment salesCount
        const bulkOps = enrichedProducts.map(({ product, quantity }) => ({
            updateOne: {
                filter: { _id: product },
                update: { $inc: { salesCount: quantity } },
            },
        }));
        await Product.bulkWrite(bulkOps);

        // Update recommendations using helper
        const productIds = enrichedProducts.map(p => p.product.toString());
        await updateRecommendationsForOrder(productIds);

        await Cart.deleteMany({ user: req.user._id });

        await notifyUser({
            userId: req.user._id.toString(),
            message: 'Your order has been placed successfully.',
            type: 'order',
        });

        res.status(201).json({ success: true, message: 'Order placed successfully', order });
    } catch (error: any) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message || 'Failed to create order' });
    }
};

export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
    try {
        const orders = await Order.find()
            .populate('user')
            .populate('products.product');

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch orders' });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user')
            .populate('products.product');

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error: any) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch order' });
    }
};

export const getOrdersByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ user: userId }).populate('products.product');

        res.status(200).json({
            success: true,
            orders, // could be empty [], which is okay
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Failed to fetch user orders' });
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

        await notifyUser({ userId: order.user.toString(), message: `Your order status was updated to '${status}'.`, type: 'order' });

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            order,
        });
    } catch (error: any) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: error.message || 'Failed to update order status' });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        await notifyUser({ userId: order.user.toString(), message: 'Your order has been cancelled.', type: 'order' });

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: error.message || 'Failed to delete order' });
    }
};

export const getOrdersByMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const orders = await Order.find({ 'products.farmer': req.user._id })
            .populate('user')
            .populate('products.product');

        res.status(200).json({ success: true, orders });
    } catch (error: any) {
        console.error('Error fetching farmer orders:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch farmer orders' });
    }
};