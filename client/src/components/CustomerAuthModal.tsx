
import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Lock, Loader2, User } from 'lucide-react';

interface CustomerAuthModalProps {
    isOpen: boolean;
    initialMode: 'login' | 'signup';
    onClose: () => void;
    onSuccess: (user: any) => void;
}

const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ isOpen, initialMode, onClose, onSuccess }) => {
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setStep('request');
            setError('');
            setMessage('');
            setOtp('');
            // Optional: You could clear the fields on re-open or keep them.
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const payload = mode === 'signup' 
                ? { action: 'signup', firstName, lastName, email, mobile }
                : { action: 'login', email };

            const response = await fetch('http://localhost:5050/customer-auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            setMessage(data.message || 'OTP sent to your email.');
            setStep('verify');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5050/customer-auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Verification failed');
            }

            // Store user and token
            localStorage.setItem('customerToken', data.token);
            localStorage.setItem('customerData', JSON.stringify(data.customer));
            
            onSuccess(data.customer);
            // Reset state
            setStep('request');
            setFirstName('');
            setLastName('');
            setEmail('');
            setMobile('');
            setOtp('');
            onClose();
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
        setMessage('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200 mt-20 max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {step === 'request' 
                                ? (mode === 'login' ? 'Welcome Back' : 'Create an Account') 
                                : 'Verify Your Email'}
                        </h2>
                        <p className="text-gray-500">
                            {step === 'request' 
                                ? (mode === 'login' ? 'Enter your email to sign in' : 'Please fill in your details to create an account')
                                : `We've sent an OTP to ${email}`}
                        </p >
                    </div >

    { error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium text-center border border-red-100">
            {error}
        </div>
    )}

{
    message && step === 'request' && (
        <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium text-center border border-green-100">
            {message}
        </div>
    )
}

{
    step === 'request' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
            {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                required={mode === 'signup'}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="John"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                required={mode === 'signup'}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Doe"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                        placeholder="Enter your email"
                    />
                </div>
            </div>

            {mode === 'signup' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="tel"
                            required={mode === 'signup'}
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Enter your mobile number"
                        />
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !email || (mode === 'signup' && (!firstName || !lastName || !mobile))}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold flex flex-col items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-70 mt-6"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
            </button>

            <div className="mt-4 text-center">
                <button
                    type="button"
                    onClick={switchMode}
                    className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                >
                    {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </form>
    ) : (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all tracking-widest text-center text-lg font-semibold"
                    placeholder="000000"
                />
            </div>
        </div>

        <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold flex flex-col items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-70 mt-6"
        >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify OTP'}
        </button>

        <div className="mt-4 text-center">
            <button
                type="button"
                onClick={() => setStep('request')}
                className="text-sm text-gray-500 hover:text-primary transition-colors"
            >
                Wrong email? Go back
            </button>
        </div>
    </form>
)
}
                </div >
            </div >
        </div >
    );
};

export default CustomerAuthModal;
