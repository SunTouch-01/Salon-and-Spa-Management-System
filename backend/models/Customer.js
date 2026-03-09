import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: function () { return this.role === 'customer'; } // Make required only if standard customer
    },
    lastName: {
        type: String,
        required: function () { return this.role === 'customer'; }
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    role: {
        type: String,
        default: 'customer',
    },
}, { timestamps: true });

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
