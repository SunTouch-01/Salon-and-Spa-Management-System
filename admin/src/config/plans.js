export const plans = [
    {
        name: "Demo Plan",
        description: "Try out all features for 14 days.",
        basePrice: 0,
        extraBranchPrice: 0,
        maxBranches: 1,
        features: [
            "All Premium Features",
            "14 Days Free Trial",
            "No Credit Card Required",
            "Single Branch"
        ],
        notIncluded: [
            "Priority Support",
            "Data Export"
        ],
        cta: "Start Free Trial",
        highlight: false,
        isDemo: true
    },
    {
        name: "Basic Style",
        description: "Essential tools for independent stylists.",
        basePrice: 199,
        extraBranchPrice: 99,
        maxBranches: 1, // Restricted
        features: [
            "Online Appointment Booking",
            "Digital Client Cards",
            "Basic Service History",
            "Email Support",
            "Trend Updates Newsletter"
        ],
        notIncluded: [
            "Client Consultation Tools",
            "Priority Support",
            "Inventory Management",
            "Multiple Branches"
        ],
        cta: "Get Started",
        highlight: false
    },
    {
        name: "Premium Salon",
        description: "Complete management for growing salons.",
        basePrice: 499,
        extraBranchPrice: 150,
        maxBranches: 10,
        features: [
            "Everything in Basic",
            "Client Consultation Tools",
            "Priority Support",
            "Inventory Management",
            "Product Sales Tracking",
            "Marketing & Promotions",
            "Multi-Branch Support"
        ],
        notIncluded: [],
        cta: "Upgrade Now",
        highlight: true
    },
    {
        name: "Enterprise",
        description: "Tailored solutions for salon chains.",
        basePrice: 999,
        extraBranchPrice: 490,
        maxBranches: 100,
        features: [
            "Everything in Premium",
            "Dedicated Account Manager",
            "Staff Performance Analytics",
            "Multi-Location Management",
            "API Access for HR Systems",
            "Unlimited Branches"
        ],
        notIncluded: [],
        cta: "Contact Sales",
        highlight: false
    }
];
