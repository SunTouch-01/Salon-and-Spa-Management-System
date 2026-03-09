import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaCalendarTimes, FaArrowRight } from 'react-icons/fa';

const TrialExpiredModal = ({ user }) => {
  const navigate = useNavigate();

  // Check if trial has actually expired
  const isTrialExpired = () => {
    if (!user || !user.subscription) return false;
    
    const { planName, trialEndDate } = user.subscription;
    
    // Only show for Demo Plan users with an expired trial
    if (planName !== 'Demo Plan' || !trialEndDate) return false;
    
    const endDate = new Date(trialEndDate);
    const now = new Date();
    
    return now > endDate;
  };

  if (!isTrialExpired()) return null;

  const handleViewPlans = () => {
    navigate('/plans-and-pricing');
  };

  // Format the expired date for display
  const formatExpiredDate = () => {
    if (!user.subscription?.trialEndDate) return '';
    const date = new Date(user.subscription.trialEndDate);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header with warning color */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <FaCalendarTimes className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Trial Period Ended</h2>
          <p className="text-white/90 text-sm">Your free trial expired on {formatExpiredDate()}</p>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-orange-500 text-4xl" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Your trial has expired!
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for trying our salon management system. To continue using all features 
            and manage your salon without interruption, please upgrade to a paid plan.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-800 text-sm font-medium">
              <span className="font-bold">Note:</span> Your data is safe and will be preserved 
              when you upgrade. Choose a plan that fits your business needs.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleViewPlans}
            className="w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>View Plans & Pricing</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-gray-400 text-xs mt-4">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;
