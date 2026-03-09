import Appointment from "../models/Appointment.js";
import Walkin from "../models/Walkin.js";
import Salon from "../models/Salon.js";
import mongoose from "mongoose";
import Staff from "../models/Staff.js";

import Client from "../models/Client.js";

// New function: Create walk-in as an appointment with category "walk-in"
export const createWalkin = async (req, res) => {
    try {
        const { salonId, clientName, clientMobile, serviceId, staffId, price, date } = req.body;

        const salon = await Salon.findById(salonId);
        if (!salon) return res.status(404).json({ message: "Salon not found" });

        // Find or create client (if mobile is provided)
        let client = null;
        if (clientMobile && clientMobile !== "0000000000") {
            client = await Client.findOne({ mobile: clientMobile, salonId });
            if (!client) {
                client = new Client({
                    salonId,
                    name: clientName,
                    mobile: clientMobile,
                    totalSpent: 0,
                    visits: 0
                });
                await client.save();
            }
        }

        // Create appointment with category "walk-in" instead of Walkin
        const appointmentDate = date ? new Date(date) : new Date();
        
        const newAppointment = new Appointment({
            ownerId: salon.ownerId,
            salonId,
            clientName,
            clientMobile,
            serviceId,
            staffId: staffId || null,
            clientId: client ? client._id : null,
            price: price || 0,
            status: "waiting", // Walk-ins start as "waiting" to match Walkin page expectations
            category: "walk-in", // Set category to walk-in
            date: appointmentDate
        });

        await newAppointment.save();

        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get walk-ins (now fetches appointments with category "walk-in")
export const getWalkinsBySalon = async (req, res) => {
    try {
        const { salonId } = req.query;
        let query = { category: "walk-in" }; // Filter by walk-in category

        if (req.user && req.user.role === 'owner') {
            if (salonId) {
                const salon = await Salon.findOne({ _id: salonId, ownerId: req.user.id });
                if (!salon) return res.status(403).json({ message: "Access denied" });
                query.salonId = salonId;
            } else {
                const salons = await Salon.find({ ownerId: req.user.id });
                query.salonId = { $in: salons.map(s => s._id) };
            }
        } else if (req.user) {
            const staff = await Staff.findById(req.user.id);
            if (!staff || !staff.salonId) return res.status(200).json([]);
            if (salonId && salonId !== staff.salonId.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
            query.salonId = staff.salonId;
        }

        // Fetch appointments with category "walk-in" instead of Walkin collection
        const walkins = await Appointment.find(query)
            .sort({ date: -1 })
            .populate("staffId", "name");

        res.status(200).json(walkins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update walk-in status (now updates appointment)
export const updateWalkinStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Find appointment instead of Walkin
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: "Walk-in not found" });

        // If status is changing to completed, create a payment record
        if (status === 'completed' && appointment.status !== 'completed') {
            const Payment = mongoose.model('Payment');
            const payment = new Payment({
                ownerId: appointment.ownerId,
                salonId: appointment.salonId,
                appointmentId: appointment._id,
                amount: appointment.price,
                method: 'cash'
            });
            await payment.save();

            // Increment staff count
            if (appointment.staffId) {
                await mongoose.model('Staff').findByIdAndUpdate(appointment.staffId, { $inc: { appointmentCount: 1 } });
            }

            // Update client total spent and visits
            if (appointment.clientId || appointment.clientMobile) {
                const clientId = appointment.clientId || (await mongoose.model('Client').findOne({
                    mobile: appointment.clientMobile,
                    salonId: appointment.salonId
                }))?._id;

                if (clientId) {
                    const finalPrice = Number(appointment.price) || 0;
                    console.log(`Updating client ${clientId} with amount ${finalPrice}`);
                    await mongoose.model('Client').findByIdAndUpdate(
                        clientId,
                        { 
                            $inc: { 
                                totalSpent: finalPrice,
                                visits: 1 
                            },
                            lastVisit: new Date()
                        }
                    );
                }
            }
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete walk-in (now deletes appointment)
export const deleteWalkin = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete appointment instead of Walkin
        await Appointment.findByIdAndDelete(id);
        res.status(200).json({ message: "Walk-in deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
