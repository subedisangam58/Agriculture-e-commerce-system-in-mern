import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderProduct {
    product: mongoose.Types.ObjectId;
    quantity: number;
    farmer: mongoose.Types.ObjectId;
}

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    products: IOrderProduct[];
    totalAmount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        products: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: [1, 'Quantity must be at least 1'],
                },
                farmer: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: [0, 'Total amount cannot be negative'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', orderSchema);