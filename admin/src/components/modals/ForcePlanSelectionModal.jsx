import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForcePlanSelectionModal = ({ user, loading: parentLoading }) => {
    const navigate = useNavigate();

    // If user exists, has owner role, and has no subscription or no planName, show modal
    const shouldShow = !parentLoading && user && user.role === 'owner' && (!user.subscription || !user.subscription.planName);

    // Show loading state while parent is loading user data
    if (parentLoading) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading your account...</p>
                </div>
            </div>
        );
    }

    if (!shouldShow) return null;

    const handleRedirectToPlans = () => {
        navigate('/plans-and-pricing');
    };

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 pointer-events-none">
            {/* Modal Content - Centered */}
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 pointer-events-auto transform transition-all">
                <div className="text-center">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
                    <p className="text-gray-600 mb-6">
                        You need an active subscription to access the dashboard features. Please choose a plan that fits your needs.
                    </p>

                    <button
                        onClick={handleRedirectToPlans}
                        className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        View Plans & Pricing
                    </button>

                    <p className="text-sm text-gray-500 mt-4">
                        Start with a 14-day free trial. No credit card required.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForcePlanSelectionModal;
