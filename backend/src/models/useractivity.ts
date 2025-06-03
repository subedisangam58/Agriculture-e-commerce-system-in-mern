import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    action: {
        type: String,
        enum: ['view', 'cart', 'purchase'],
        required: true,
    },
    timestamp: { type: Date, default: Date.now },
});

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);
export default UserActivity;
