import Customer from '../models/Customer.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (req, res) => {
    try {
        const { action, email, mobile, firstName, lastName } = req.body;

        if (!action || !email) {
            return res.status(400).json({ message: 'Action and email are required.' });
        }

        let customer = await Customer.findOne({ email });

        if (action === 'login') {
            if (!customer) {
                return res.status(404).json({ message: 'Account not found. Please sign up first.' });
            }
        } else if (action === 'signup') {
            if (customer) {
                return res.status(400).json({ message: 'Account already exists. Please log in.' });
            }
            if (!mobile || !firstName || !lastName) {
                return res.status(400).json({ message: 'Mobile, first name, and last name are required for signup.' });
            }
            customer = new Customer({ email, mobile, firstName, lastName });
        } else {
            return res.status(400).json({ message: 'Invalid action.' });
        }

        const otp = generateOTP();
        // OTP expires in 10 minutes
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        customer.otp = otp;
        customer.otpExpires = otpExpires;

        await customer.save();

        // Send OTP via email
        const message = `Your GlowBiz login OTP is: ${otp}. It will expire in 10 minutes.`;

        await sendEmail({
            email: customer.email,
            subject: 'GlowBiz - Your Login OTP',
            message: message
        });

        // For testing/development: return OTP in response body (REMOVE IN PRODUCTION)
        res.status(200).json({
            message: 'OTP sent successfully to your email. (Check network tab or console)',
            otp: otp // Temporarily enabled for testing since email is not configured
        });

    } catch (error) {
        console.error('Error in sendOtp:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const customer = await Customer.findOne({ email });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        if (customer.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        if (customer.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Clear OTP
        customer.otp = null;
        customer.otpExpires = null;
        await customer.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: customer._id, role: customer.role },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Successfully verified.',
            token,
            customer: {
                id: customer._id,
                email: customer.email,
                mobile: customer.mobile,
                firstName: customer.firstName,
                lastName: customer.lastName,
                role: customer.role
            }
        });

    } catch (error) {
        console.error('Error in verifyOtp:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
