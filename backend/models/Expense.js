import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon",
        required: true,
    },
    category: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'],
        default: 'Cash',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    receipt: {
        type: String, // URL to receipt image if any
        default: '',
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
    },
}, { timestamps: true });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
