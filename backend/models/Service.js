import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon",
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['unisex', 'male', 'female', 'both'],
        required: true,
    },
    priceUnisex: {
        type: Number,
        required: function () { return this.gender === 'unisex'; },
    },
    priceMale: {
        type: Number,
        required: function () { return this.gender === 'male' || this.gender === 'both'; },
    },
    priceFemale: {
        type: Number,
        required: function () { return this.gender === 'female' || this.gender === 'both'; },
    },
    duration: {
        type: Number, // in minutes
        required: true,
    },
    imageUrl: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Service = mongoose.model("Service", serviceSchema);

export default Service;
