import { Request, Response } from "express";
import IProduct from "../models/product";
import { uploadToCloudinary } from "../utils/cloudinary";
import fs from "fs";
import { IUser } from "../models/user";
import { notifyUser } from "../utils/notifyUser";
import { generateEmbedding } from "../utils/embedder";
import { cosineSimilarity } from "../utils/cosineSimilarity";

// Local interface to extend Express Request
interface AuthenticatedRequest extends Request {
    user?: IUser & { _id: string };
}

export const addProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'farmer') {
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
                const result = await uploadToCloudinary((req.file as Express.Multer.File).path) as { secure_url: string };
                imageUrl = result.secure_url;
                fs.unlink((req.file as Express.Multer.File).path, err => {
                    if (err) console.error("Error removing temp file:", err);
                });
            } catch (uploadError: any) {
                res.status(400).json({ success: false, message: `Image upload failed: ${uploadError.message}` });
                return;
            }
        }

        // Generate local embedding (offline)
        let embedding: number[] | undefined = undefined;
        try {
            const fullText = `${name} ${description || ""}`;
            embedding = await generateEmbedding(fullText);
        } catch (err) {
            console.error("Embedding error:", err);
            res.status(500).json({ success: false, message: "Failed to generate embedding for product" });
            return;
        }

        const newProduct = new IProduct({
            name,
            description,
            price,
            category,
            imageUrl,
            quantity: quantity || 0,
            createdBy: req.user._id,
            embedding, // Store vector
        });

        await newProduct.save();

        await notifyUser({
            userId: req.user._id.toString(),
            message: 'Your product was added successfully.',
            type: 'product'
        });

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });

    } catch (error: any) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to add product" });
    }
};

export const getProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const { quantity, category, minPrice, maxPrice, search, page = 1, limit = 10 } = _req.query;
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
        const products = await IProduct.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        const total = await IProduct.countDocuments(query);

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

    } catch (error: any) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch products"
        });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Increment view count
        await IProduct.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

        // Then fetch updated product (optional but useful)
        const product = await IProduct.findById(id).populate('createdBy', 'name');

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error: any) {
        console.error("Error fetching product:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch product"
        });
    }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.params;
        const products = await IProduct.find({ category });

        res.status(200).json({
            success: true,
            products
        });

    } catch (error: any) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch products by category"
        });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates: any = req.body;

        if (req.file) {
            try {
                const result = await uploadToCloudinary((req.file as Express.Multer.File).path) as { secure_url: string };
                updates.imageUrl = result.secure_url;
                fs.unlink((req.file as Express.Multer.File).path, (err) => {
                    if (err) console.error("Error removing temp file:", err);
                });
            } catch (uploadError: any) {
                res.status(400).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message}`
                });
                return;
            }
        }

        const product = await IProduct.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error: any) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update product"
        });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const product = await IProduct.findByIdAndDelete(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error: any) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete product"
        });
    }
};

export const getTopSellingProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await IProduct.find().sort({ salesCount: -1 }).limit(10);

        res.status(200).json({
            success: true,
            products
        });
    } catch (error: any) {
        console.error("Error fetching top-selling products:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch top-selling products"
        });
    }
};

export const getMostViewedProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const products = await IProduct.find().sort({ viewCount: -1 }).limit(10);

        res.status(200).json({
            success: true,
            products
        });
    } catch (error: any) {
        console.error("Error fetching most viewed products:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch most viewed products"
        });
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

        const products = await IProduct.find({ embedding: { $exists: true } });

        const scored = products.map(product => {
            const score = cosineSimilarity(queryEmbedding, product.embedding || []);
            return { product, score };
        });

        const topMatches = scored
            .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
            .slice(0, 5)
            .map(({ product, score }) => ({
                ...product.toObject(),
                similarity: score
            }));

        res.status(200).json({
            success: true,
            results: topMatches
        });

    } catch (error: any) {
        console.error("Vector search error:", error);
        res.status(500).json({ success: false, message: "Failed to perform local vector search." });
    }
};
