import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { plans } from '../config/plans';

function Plans_and_pricing() {

  const [isAnnual, setIsAnnual] = useState(false);
  const [branches, setBranches] = useState(1);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [hasUsedDemo, setHasUsedDemo] = useState(false);
  const navigate = useNavigate();



  React.useEffect(() => {
    const fetchCurrentPlan = async () => {
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      if (userId && role === 'owner') {
        try {
          const response = await fetch(`http://localhost:5050/auth/me?userId=${userId}&role=${role}`);
          if (response.ok) {
            const data = await response.json();
            if (data.subscription?.branchLimit) {
              setBranches(data.subscription.branchLimit);
            }
            if (data.subscription?.planName) {
              setCurrentPlan(data.subscription.planName);
            }
            if (data.subscription?.hasUsedDemo) {
              setHasUsedDemo(data.subscription.hasUsedDemo);
            }

          }

        } catch (error) {
          console.error("Error fetching current plan:", error);
        }
      }
    };
    fetchCurrentPlan();
  }, []);

  // Pricing Logic
  // Base price is for 1 branch. Extra branches add cost.
  // Example logic:
  // Basic: Free (1 branch only)
  // Premium: $29 + $15 per extra branch
  // Corporate: $99 + $49 per extra branch

  const calculatePrice = (plan) => {
    let price = plan.basePrice;
    if (branches > 1 && plan.extraBranchPrice > 0) {
      price += (branches - 1) * plan.extraBranchPrice;
    }
    if (isAnnual) {
      price = price * 10; // 12 months for price of 10
    }
    return price;
  };

  const handleSelectPlan = async (plan) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role) {
      // User not logged in
      if (window.confirm("You need to login to select a plan. Go to login?")) {
        navigate('/login');
      }
      return;
    }

    if (role !== 'owner') {
      alert("Only salon owners can subscribe to plans.");
      return;
    }

    // Logic for Basic plan restriction
    if (plan.name === "Basic Style" && branches > 1) {
      alert("Basic plan supports only 1 branch. Please select Premium or Enterprise.");
      return;
    }

    try {
      const computedPrice = calculatePrice(plan);

      const response = await fetch('http://localhost:5050/owner/update-plan', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planName: plan.name,
          price: Number(computedPrice) || 0,
          branchLimit: Number(plan.maxBranches),
          billingCycle: isAnnual ? 'yearly' : 'monthly'
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully subscribed to ${plan.name}!`);
        navigate('/dashboard/settings'); // Redirect to settings to see updated plan
      } else {
        alert(data.message || "Failed to update plan");
      }

    } catch (error) {
      console.error("Error updating plan:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <>

      <div className="min-h-screen bg-bg-light py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-2">Pricing Plans</h2>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Invest in your <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Business</span>
            </h1>
            <p className="text-xl text-gray-500 mb-8">
              Transparent pricing for world-class salon management. Choose the plan that fits your needs best.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-gray-200"
                role="switch"
                aria-checked={isAnnual}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnnual ? 'translate-x-5 bg-primary' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly <span className="text-primary text-xs font-bold ml-1">(Save ~17%)</span>
              </span>
            </div>

            {/* Branch Slider */}
            <div className="bg-white p-6 rounded-2xl shadow-sm max-w-md mx-auto border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-4">
                Number of Branches: <span className="text-primary text-lg">{branches}</span>
              </label>
              <div className="relative pt-2 pb-6 px-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={branches}
                  onChange={(e) => setBranches(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between w-full px-0.5 mt-2 text-xs font-medium text-gray-400">
                  <span className="flex flex-col items-center">
                    <span className="h-1 w-px bg-gray-300 mb-1"></span>
                    1
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="h-1 w-px bg-gray-300 mb-1"></span>
                    10+
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="h-1 w-px bg-gray-300 mb-1"></span>
                    20+
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="h-1 w-px bg-gray-300 mb-1"></span>
                    30+
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="h-1 w-px bg-gray-300 mb-1"></span>
                    40+
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="h-1 w-px bg-gray-300 mb-1"></span>
                    50+
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, index) => {
              const isDisabled = branches > plan.maxBranches || (plan.isDemo && hasUsedDemo);
              const isCurrentPlan = currentPlan === plan.name;
              const isDemoUsed = plan.isDemo && hasUsedDemo;


              return (
                <div
                  key={index}
                  className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${plan.highlight
                    ? 'bg-white shadow-[0_20px_40px_rgba(147,129,255,0.25)] border-2 border-primary z-10 scale-105 md:scale-110'
                    : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100 hover:shadow-2xl'
                    } ${isDisabled ? 'opacity-60 grayscale' : 'ring-2 ring-primary/20 bg-linear-to-b from-white to-primary/5'} ${isCurrentPlan ? 'ring-4 ring-green-400 bg-green-50/30' : ''}`}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Current Plan
                    </div>
                  )}
                  {isDemoUsed && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Already Used
                    </div>
                  )}
                  {!isDisabled && !isCurrentPlan && !isDemoUsed && (

                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Available
                    </div>
                  )}

                  {plan.highlight && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 h-10">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ₹{calculatePrice(plan)}
                    </span>
                    <span className="text-gray-500 font-medium">/{isAnnual ? 'year' : 'month'}</span>
                  </div>

                  {isDisabled && (
                    <p className="text-red-500 text-xs font-bold mb-2">
                      {isDemoUsed ? '* You have already used the Demo Plan' : `* Supports max ${plan.maxBranches} branches`}
                    </p>
                  )}


                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <FaCheck className="text-primary mt-1 mr-3 shrink-0" size={14} />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, idx) => (
                      <li key={idx} className="flex items-start opacity-50">
                        <FaTimes className="text-gray-400 mt-1 mr-3 shrink-0" size={14} />
                        <span className="text-gray-500 text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isDisabled || isCurrentPlan}
                    className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg ${isCurrentPlan 
                      ? 'bg-green-500 text-white border-2 border-green-500 cursor-not-allowed' 
                      : plan.highlight
                        ? 'bg-primary text-white hover:bg-[#7a67e0] cursor-pointer'
                        : 'bg-white text-primary border-2 border-primary hover:bg-bg-light cursor-pointer'
                      } ${isDisabled && !isCurrentPlan ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {isCurrentPlan ? 'Currently using this plan' : isDemoUsed ? 'Demo Already Used' : isDisabled ? 'Plan Limit Exceeded' : plan.cta}
                  </button>



                </div>
              )
            })}
          </div>

          {/* FAQ or Extra Info Section */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Have questions?</h3>
            <p className="text-gray-500 mb-8">Our support team is available 24/7 to help you decide.</p>
            <a href="/contact" className="text-primary font-semibold hover:text-secondary underline transition-colors">
              Contact Support
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default Plans_and_pricing
