import { Response } from 'express';
import { AuthenticatedRequest } from '../types/CustomRequests';
import Cart from '../models/cart';

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?._id;

        if (!productId || !quantity || !userId) {
            res.status(400).json({ success: false, message: 'Missing productId, quantity, or user' });
            return;
        }

        const existingItem = await Cart.findOne({ user: userId, product: productId });

        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
            res.status(200).json({
                success: true,
                message: 'Cart updated',
                cart: existingItem,
            });
        } else {
            const cartItem = new Cart({ user: userId, product: productId, quantity });
            await cartItem.save();
            res.status(201).json({
                success: true,
                message: 'Item added to cart',
                cart: cartItem,
            });
        }
    } catch (error: any) {
        console.error('Error in addToCart:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to add to cart' });
    }
};

export const getUserCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const cartItems = await Cart.find({ user: userId }).populate('product');
        res.status(200).json({
            success: true,
            cart: cartItems,
        });
    } catch (error: any) {
        console.error('Error in getUserCart:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch cart' });
    }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const { quantity } = req.body;

        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }

        if (!quantity || quantity < 1) {
            res.status(400).json({ success: false, message: "Invalid quantity" });
            return;
        }

        const item = await Cart.findOne({ _id: id, user: userId });
        if (!item) {
            res.status(404).json({ success: false, message: "Cart item not found" });
            return;
        }

        item.quantity = quantity;
        await item.save();

        res.status(200).json({ success: true, message: "Quantity updated", cart: item });
    } catch (error: any) {
        console.error("Error in updateCartItem:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to update item" });
    }
};

