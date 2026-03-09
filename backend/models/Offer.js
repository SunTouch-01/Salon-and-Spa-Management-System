import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed'],
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    validFrom: {
        type: Date,
        required: true,
    },
    validTo: {
        type: Date,
        required: true,
    },
    services: [{
        type: String, // Service names or 'All Services'
    }],
    minPurchase: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    imageUrl: {
        type: String,
    },
}, { timestamps: true });

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
