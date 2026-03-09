import Owner from "../models/Owner.js";

// Update Owner Subscription Plan
export const updatePlan = async (req, res) => {
    try {
        const ownerId = req.user.id; // From auth middleware
        const { planName, price, branchLimit, billingCycle } = req.body;

        if (!planName) {
            return res.status(400).json({ message: "Plan name is required" });
        }

        // Fetch the owner first to check demo plan usage and get current state
        const owner = await Owner.findById(ownerId);
        
        if (!owner) {
            return res.status(404).json({ message: "Owner not found" });
        }

        // Check if user is trying to select Demo Plan and has already used it
        if (planName === 'Demo Plan' && owner.subscription && owner.subscription.hasUsedDemo) {
            return res.status(403).json({ 
                message: "You have already used the Demo Plan. Please select a paid plan to continue." 
            });
        }

        const updatedOwner = await Owner.findByIdAndUpdate(
            ownerId,
            {
                $set: {
                    subscription: {
                        planName,
                        price: Number(price) || 0,
                        branchLimit: Number(branchLimit) || 1,
                        billingCycle: billingCycle || 'monthly',
                        startDate: new Date(),
                        isActive: true,
                        // If it's the demo plan, set the trial dates and mark hasUsedDemo
                        trialStartDate: planName === 'Demo Plan' ? new Date() : null,
                        trialEndDate: planName === 'Demo Plan' ? new Date(new Date().getTime() + 60 * 1000) : null,
                        // trialEndDate: planName === 'Demo Plan' ? new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000) : null
                        hasUsedDemo: planName === 'Demo Plan' ? true : (owner.subscription?.hasUsedDemo || false)
                    }
                }
            },
            { new: true }
        ).select("-password");


        if (!updatedOwner) {
            return res.status(404).json({ message: "Owner not found" });
        }

        res.status(200).json({
            message: "Plan updated successfully",
            subscription: updatedOwner.subscription
        });

    } catch (error) {
        console.error("Error updating plan:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
