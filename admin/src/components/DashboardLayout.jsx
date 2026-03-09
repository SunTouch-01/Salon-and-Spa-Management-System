import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import BottomNav from './BottomNav';
import { useSalon } from '../context/SalonContext';
import ForcePlanSelectionModal from './modals/ForcePlanSelectionModal';
import TrialExpiredModal from './modals/TrialExpiredModal';
import DemoWatermark from './DemoWatermark';


const DashboardLayout = () => {
  const { fetchSalons, user, loading } = useSalon();
  const location = useLocation();

  useEffect(() => {
    fetchSalons();
  }, []);


  // Check if user is an owner without a subscription plan
  const hasNoPlan = user && user.role === 'owner' && (!user.subscription || !user.subscription.planName);
  
  // Check if trial has expired
  const isTrialExpired = () => {
    if (!user || !user.subscription) return false;
    const { planName, trialEndDate } = user.subscription;
    if (planName !== 'Demo Plan' || !trialEndDate) return false;
    const endDate = new Date(trialEndDate);
    const now = new Date();
    return now > endDate;
  };

  const trialExpired = isTrialExpired();
  
  // Check if current page is profile or settings (these should not be blurred and modal should not show)
  const isUnblurredPage = location.pathname === '/dashboard/profile' || location.pathname === '/dashboard/settings';
  
  // Show blur overlay when user has no plan or trial expired, except on profile/settings pages
  const shouldBlurContent = !loading && !isUnblurredPage && (hasNoPlan || trialExpired);
  
  // Show modal only when not on profile/settings pages
  const shouldShowModal = !isUnblurredPage && (hasNoPlan || trialExpired);



  return (
    <>
      {/* Forced Plan Selection Modal - Simple popup with redirect button (hidden on profile/settings) */}
      {shouldShowModal && <ForcePlanSelectionModal user={user} loading={loading} />}

      
      {/* Trial Expired Modal - Shows when trial has ended */}
      <TrialExpiredModal user={user} />
      
      {/* Sidebar for Desktop - Always accessible, not blurred */}
      <div className={`hidden md:block fixed left-0 top-0 h-screen z-40 ${shouldBlurContent ? '' : ''}`}>
        <DashboardSidebar />
      </div>

      {/* Bottom Nav for Mobile - Always accessible, not blurred */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${shouldBlurContent ? '' : ''}`}>
        <BottomNav />
      </div>
      
      {/* Main Content Area - Blurred when user has no plan or trial expired */}
      <div className={`min-h-screen bg-bg-light pb-16 md:pb-0 relative transition-all duration-300 ${shouldBlurContent ? 'blur-sm pointer-events-none' : ''}`}>

        {/* Demo Watermark */}
        {user && user.subscription?.planName === 'Demo Plan' && (
          <DemoWatermark trialEndDate={user.subscription.trialEndDate} />
        )}

        {/* Main Content Area */}
        <main className="md:ml-64 p-4 md:p-8 min-h-screen transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </>
  );
};


export default DashboardLayout;
