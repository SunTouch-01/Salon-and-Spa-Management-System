import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner",
        required: true,
    },
    salonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon",
        required: true,
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: false,
    },
    walkinId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Walkin",
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    method: {
        type: String, // 'cash', 'card', 'online'
        required: true,
    },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
