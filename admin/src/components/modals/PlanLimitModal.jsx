import React from 'react';
import { FaCrown, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PlanLimitModal = ({ isOpen, onClose, currentLimit }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-end sticky top-0 bg-white z-10">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-8 text-center overflow-y-auto scrollbar-hide flex-1">
                    <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <FaCrown className="text-primary text-4xl" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Limit Reached!</h2>
                    <p className="text-gray-600 mb-4">
                        You have reached your current plan's limit of <span className="font-bold text-primary">{currentLimit}</span> branch{currentLimit > 1 ? 'es' : ''}.
                        Upgrade to a higher plan to add more branches and unlock premium features.
                    </p>
                </div>

                <div className="p-8 pt-4 border-t sticky bottom-0 bg-white shadow-[0_-10px_20px_rgba(255,255,255,1)]">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/plans-and-pricing');
                            }}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-secondary transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            View Plans & Upgrade
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
                        >
                            Maybe Later
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 bg-gray-50 py-2 rounded-lg">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Premium Feature Only</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanLimitModal;
