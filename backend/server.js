import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import salonRoutes from "./routes/salon.js";
import staffRoutes from "./routes/staff.js";
import serviceRoutes from "./routes/service.js";
import appointmentRoutes from "./routes/appointment.js";
import paymentRoutes from "./routes/payment.js";
import clientRoutes from "./routes/client.js";
import offerRoutes from "./routes/offer.js";
import ownerRoutes from "./routes/owner.js";
import inventoryRoutes from "./routes/inventory.js";
import expenseRoutes from "./routes/expense.js";
import attendanceRoutes from "./routes/attendance.js"; // [NEW]
import walkinRoutes from "./routes/walkin.js";
import categoryRoutes from "./routes/category.js";
import reportRoutes from "./routes/report.js"; // [NEW]
import customerAuthRoutes from "./routes/customerAuth.js"; // [NEW]

dotenv.config();


const PORT = 5050;
const app = express();

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/salons", salonRoutes);
app.use("/staff", staffRoutes);
app.use("/services", serviceRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/payments", paymentRoutes);
app.use("/clients", clientRoutes);
app.use("/offers", offerRoutes);
app.use("/owner", ownerRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/expenses", expenseRoutes);
app.use("/attendance", attendanceRoutes); // [NEW]
app.use("/walkins", walkinRoutes);
app.use("/categories", categoryRoutes);
app.use("/reports", reportRoutes); // [NEW]
app.use("/customer-auth", customerAuthRoutes); // [NEW]


app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});