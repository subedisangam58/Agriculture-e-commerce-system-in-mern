import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string | null;
    category: string;
    quantity: number;
    isActive: boolean;
    viewCount: number;
    salesCount: number;
    createdBy: mongoose.Types.ObjectId;
    embedding?: number[];  // <-- Added for vector search
    createdAt?: Date;
    updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative'],
        },
        imageUrl: {
            type: String,
            default: null,
        },
        category: {
            type: String,
            required: [true, 'Product category is required'],
            trim: true,
        },
        quantity: {
            type: Number,
            default: 0,
            min: [0, 'Quantity cannot be negative'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        salesCount: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        embedding: {
            type: [Number], // <- Store embedding as array of numbers
            required: false,
            default: undefined,
        },
    },
    {
        timestamps: true,
    }
);

// Enable text index for search on `name` and `description`
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
