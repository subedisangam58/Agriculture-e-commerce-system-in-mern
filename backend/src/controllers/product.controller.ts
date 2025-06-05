import { Request, Response } from "express";
import Product from "../models/product"; // Mongoose model, not interface
import User from "../models/user";
import { uploadToCloudinary } from "../utils/cloudinary";
import fs from "fs";
import { notifyUser } from "../utils/notifyUser";
import { generateEmbedding } from "../utils/embedder";
import { cosineSimilarity } from "../utils/cosineSimilarity";

// Extend request to access userId from JWT
interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const addProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'farmer') {
            res.status(403).json({ success: false, message: "Only farmers are allowed to add products" });
            return;
        }

        const { name, description, price, category, quantity } = req.body;
        if (!name || !price || !category) {
            res.status(400).json({ success: false, message: "Name, price, and category are required" });
            return;
        }

        let imageUrl: string | null = null;

        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.path) as { secure_url: string };
                imageUrl = result.secure_url;
                fs.unlink(req.file.path, err => {
                    if (err) console.error("Error removing temp file:", err);
                });
            } catch (uploadError: unknown) {
                const err = uploadError as Error;
                res.status(400).json({ success: false, message: `Image upload failed: ${err.message}` });
                return;
            }
        }

        let embedding: number[] | undefined = undefined;
        try {
            const fullText = `${name} ${description || ""}`;
            embedding = await generateEmbedding(fullText);
        } catch (err) {
            console.warn("Embedding generation failed. Continuing without it.", err);
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            imageUrl,
            quantity: quantity || 0,
            createdBy: user._id,
            embedding,
        });

        await newProduct.save();

        await notifyUser({
            userId: (user._id as string | { toString(): string }).toString(),
            message: 'Your product was added successfully.',
            type: 'product'
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error adding product:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to add product" });
    }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { quantity, category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;
        const query: any = {};

        if (category) query.category = category;
        if (quantity) query.quantity = quantity;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const products = await Product.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error("Error fetching products:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch products"
        });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

        const product = await Product.findById(id).populate('createdBy', 'name');
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }

        res.status(200).json({ success: true, product });
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category });
        res.status(200).json({ success: true, products });
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates: any = req.body;

        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }

        if (product.createdBy.toString() !== req.userId) {
            res.status(403).json({ success: false, message: "Unauthorized action" });
            return;
        }

        if (req.file) {
            try {
                const result = await uploadToCloudinary(req.file.path) as { secure_url: string };
                updates.imageUrl = result.secure_url;
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error removing temp file:", err);
                });
            } catch (uploadError: unknown) {
                const err = uploadError as Error;
                res.status(400).json({
                    success: false,
                    message: `Image upload failed: ${err.message}`
                });
                return;
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }

        if (product.createdBy.toString() !== req.userId) {
            res.status(403).json({ success: false, message: "Unauthorized action" });
            return;
        }

        await product.deleteOne();

        res.status(200).json({ success: true, message: "Product deleted successfully" });

    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getTopSellingProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find().sort({ salesCount: -1 }).limit(10);
        res.status(200).json({ success: true, products });
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getMostViewedProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await Product.find().sort({ viewCount: -1 }).limit(10);
        res.status(200).json({ success: true, products });
    } catch (error: unknown) {
        const err = error as Error;
        res.status(500).json({ success: false, message: err.message });
    }
};

export const searchProductsByVector = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== "string") {
            res.status(400).json({ success: false, message: "Query is required" });
            return;
        }

        const queryEmbedding = await generateEmbedding(query);
        const products = await Product.find({ embedding: { $exists: true } });

        const scored = products.map(product => {
            const score = cosineSimilarity(queryEmbedding, product.embedding || []);
            return { product, score };
        });

        const topMatches = scored
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .slice(0, 5)
            .map(({ product, score }) => ({
                ...product.toObject(),
                similarity: score
            }));

        res.status(200).json({
            success: true,
            results: topMatches
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error("Vector search error:", err);
        res.status(500).json({ success: false, message: "Failed to perform local vector search." });
    }
};
