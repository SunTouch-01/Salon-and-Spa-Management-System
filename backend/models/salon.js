import mongoose from "mongoose";

const salonSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  branchArea: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  }],
  imageUrl: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  openTime: {
    type: String,
    default: "09:00",
  },
  closeTime: {
    type: String,
    default: "20:00",
  },
  workingDays: {
    type: [String],
    default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
}, { timestamps: true });


const Salon = mongoose.model("Salon", salonSchema);

export default Salon;
