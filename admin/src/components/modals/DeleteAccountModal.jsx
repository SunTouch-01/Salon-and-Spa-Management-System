import React from 'react';
import { FaTimes } from 'react-icons/fa';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm }) => {
    const [password, setPassword] = React.useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(password);
        setPassword('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-xl relative zoom-in-95 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
                    <p className="text-gray-600 mb-6">Are you sure you want to delete your account? This action cannot be undone.</p>
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-gray-50 transition-all"
                        />
                    </div>
                </div>

                <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white shadow-[0_-10px_20px_rgba(255,255,255,1)]">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                        Nevermind
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none active:scale-95"
                        disabled={!password}
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
