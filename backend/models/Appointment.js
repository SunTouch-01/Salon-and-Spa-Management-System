import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
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
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: false,
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
    },
    serviceId: {
        type: String, // String to support both real ObjectIds and dummy IDs like "1", "2"
        required: false,
    },
    clientName: {
        type: String,
        required: true,
    },
    clientMobile: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "completed", "cancelled", "waiting", "in-service"],
        default: "pending",
    },
    note: {
        type: String,
        default: null,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        enum: ["online", "walk-in"],
        default: "online",
    },
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
