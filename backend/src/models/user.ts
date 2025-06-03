import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'farmer' | 'user';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    role: UserRole;
    imageUrl?: string;
    lastLogin?: Date;
    resetPasswordToken?: string;
    resetPasswordExpiresAt?: Date;
    verificationToken?: string;
    verificationTokenExpiresAt?: Date;
    isAdmin?: boolean;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: [true, 'Name is required'] },
        email: { type: String, required: [true, 'Email is required'], unique: true },
        password: { type: String, required: [true, 'Password is required'] },
        address: { type: String, required: [true, 'Address is required'] },
        phone: { type: String, required: [true, 'Phone number is required'] },
        role: {
            type: String,
            enum: ['admin', 'farmer', 'user'],
            default: 'user',
        },
        imageUrl: { type: String }, // ✅ new field for profile picture
        lastLogin: { type: Date, default: Date.now },
        resetPasswordToken: { type: String },
        resetPasswordExpiresAt: { type: Date },
        verificationToken: { type: String },
        verificationTokenExpiresAt: { type: Date },
        isAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
