import Owner from "../models/Owner.js";
import Staff from "../models/Staff.js";
import Salon from "../models/Salon.js";
import Appointment from "../models/Appointment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

export const signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingOwner = await Owner.findOne({ email });
        if (existingOwner) {
            return res.status(409).json({ message: "Owner already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newOwner = new Owner({
            name,
            email,
            password: hashedPassword,
            phone,

        })
        await newOwner.save();

        return res.status(201).json({ message: "Owner registered successfully" });
    }
    catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
export const signin = async (req, res) => {
    try {
        const { email, password, role } = req.body; // Role: 'owner' or 'staff' (or other staff roles)

        console.log("=== SIGNIN DEBUG ===");
        console.log("Email:", email);
        console.log("Role:", role);
        console.log("Password provided:", !!password);

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        let user;
        let isOwner = false;

        // Check Owner first if no role specified or role is owner
        if (!role || role === 'owner') {
            console.log("Checking Owner collection...");
            user = await Owner.findOne({ email });
            if (user) {
                console.log("User found in Owner collection");
                isOwner = true;
            } else {
                console.log("User NOT found in Owner collection");
            }
        }

        // If not found in Owner, check Staff
        if (!user && (!role || role !== 'owner')) {
            console.log("Checking Staff collection...");
            user = await Staff.findOne({ email });
            if (user) {
                console.log("User found in Staff collection");
                console.log("Staff user details:", {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    hasPassword: !!user.password
                });
            } else {
                console.log("User NOT found in Staff collection");
            }
        }

        if (!user) {
            console.log("No user found - returning 401");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.password) {
            console.log("User has no password set - returning 401");
            return res.status(401).json({ message: "Account not set up for login. Please contact administrator." });
        }

        // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
        const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        let isMatch = false;

        if (isPasswordHashed) {
            // Password is hashed, use bcrypt.compare
            console.log("Password is hashed, using bcrypt.compare");
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Password is plain text (legacy data), compare directly
            console.log("⚠️  WARNING: Password is stored in PLAIN TEXT! This is a security risk.");
            console.log("   Please update this account's password to hash it properly.");
            isMatch = (password === user.password);
        }

        console.log("Password match:", isMatch);

        if (!isMatch) {
            console.log("Password mismatch - returning 401");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: isOwner ? 'owner' : user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        console.log("Login successful!");
        return res.status(200).json({
            message: "Signin successful",
            token,
            userId: user._id,
            role: isOwner ? 'owner' : user.role,
            name: user.name,
            accessToTabs: isOwner ? null : (user.accessToTabs || []), // null = all access for owners
            salonId: isOwner ? null : user.salonId, // Include salonId for staff
        });
    } catch (error) {
        console.error("Signin Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const { userId, role } = req.query; // Or from middleware req.user

        if (!userId || !role) {
            return res.status(400).json({ message: "User ID and Role are required" });
        }

        let user;
        if (role === 'owner') {
            user = await Owner.findById(userId).select('-password');
        } else {
            user = await Staff.findById(userId).populate('salonId').select('-password');
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = user.toObject();
        userData.role = role;

        res.status(200).json(userData);
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { userId, role, name, email, phone, dob, gender, address, city, zipCode, avatarUrl } = req.body;

        if (!userId || !role) {
            return res.status(400).json({ message: "User ID and Role are required" });
        }

        const updateData = { name, email, phone, dob, gender, address, city, zipCode, avatarUrl };

        let user;
        if (role === 'owner') {
            user = await Owner.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        } else {
            user = await Staff.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// ... existing imports ...

// ... existing code ...

export const changePassword = async (req, res) => {
    try {
        const { userId, role, currentPassword, newPassword } = req.body;

        if (!userId || !role || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let user;
        if (role === 'owner') {
            user = await Owner.findById(userId);
        } else {
            user = await Staff.findById(userId);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { userId, role, password } = req.body;

        if (!userId || !role || !password) {
            return res.status(400).json({ message: "User ID, role, and password are required" });
        }

        let user;
        if (role === 'owner') {
            user = await Owner.findById(userId);
        } else {
            // For staff, maybe just delete the staff record? Or do we allow staff to delete themselves?
            // User request implied Owner account deletion cascades to everything.
            // Let's assume this feature is mainly for Owners to wipe their business.
            return res.status(403).json({ message: "Only owners can delete their account and business data." });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // 1. Find all salons owned by this user
        const salons = await Salon.find({ ownerId: userId });
        const salonIds = salons.map(salon => salon._id);

        // 2. Delete Appointments for these salons
        await Appointment.deleteMany({ salonId: { $in: salonIds } });

        // 3. Delete Staff for these salons
        await Staff.deleteMany({ salonId: { $in: salonIds } });

        // 4. Delete Salons
        await Salon.deleteMany({ ownerId: userId });

        // 5. Delete Owner
        await Owner.findByIdAndDelete(userId);

        res.status(200).json({ message: "Account and all related data deleted successfully" });

    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
