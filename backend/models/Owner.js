import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    dob: { type: Date, default: null },
    gender: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    zipCode: { type: String, default: null },
    salons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Salon",
        },
    ],
    subscription: {
        planName: { type: String, default: null },
        price: { type: Number, default: 0 },
        branchLimit: { type: Number, default: 1 },
        billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
        startDate: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
        trialStartDate: { type: Date, default: null },
        trialEndDate: { type: Date, default: null },
        hasUsedDemo: { type: Boolean, default: false }
    },

    avatarUrl: {
        type: String,
        default: null,
    },
}, { timestamps: true });

const Owner = mongoose.model("Owner", ownerSchema);

export default Owner;
