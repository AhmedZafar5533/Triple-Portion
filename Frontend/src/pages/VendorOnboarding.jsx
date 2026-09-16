import { useEffect, useState } from 'react';
import { useVendorStore } from '../store/vendorStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressSteps from '../components/vendorOnboarding/ProgressSteps';
import BusinessInformation from '../components/vendorOnboarding/BusinessInfo';
import BusinessContact from '../components/vendorOnboarding/BusinessContact';
import OwnerInformation from '../components/vendorOnboarding/OwnerInfo';
import ContactPerson from '../components/vendorOnboarding/ContactPerson';
import BusinessAddress from '../components/vendorOnboarding/BusinessAddress';

const VendorOnboardingForm = ({ isDashboardView = false }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
    const navigate = useNavigate();
    const totalSteps = 5;

    const { initializeOnboarding, isInitialized, vendor, loading } = useVendorStore();
    const { user } = useAuthStore();

    useEffect(() => {
        document.title = "Vendor Onboarding | Triple Portion";
    }, []);

    useEffect(() => {
        if (!isInitialized) {
            initializeOnboarding();
        }
    }, [initializeOnboarding, isInitialized]);

    // Only sync currentStep from backend on initial initialization
    useEffect(() => {
        if (vendor && vendor.currentStep && !isInitialized) {
            if (vendor.status === 'Pending' || vendor.status === 'Approved') {
                if (!isDashboardView) navigate('/dashboard/seller');
                return;
            }
            setCurrentStep(vendor.currentStep);
        }
    }, [vendor, isInitialized, navigate, isDashboardView]);

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setDirection(1);
            setCurrentStep((prev) => prev + 1);
            if (!isDashboardView) window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setDirection(-1);
            setCurrentStep((prev) => prev - 1);
            if (!isDashboardView) window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onComplete = () => {
        if (!isDashboardView) navigate('/dashboard/seller');
        else window.location.reload(); // Refresh to trigger dashboard state change
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0
        })
    };

    const renderForm = () => {
        const props = { nextStep, prevStep, currentStep, totalSteps, onComplete };
        switch (currentStep) {
            case 1: return <BusinessInformation {...props} />;
            case 2: return <BusinessContact {...props} />;
            case 3: return <OwnerInformation {...props} />;
            case 4: return <ContactPerson {...props} />;
            case 5: return <BusinessAddress {...props} />;
            default: return null;
        }
    };

    if (loading && !isInitialized) {
        return (
            <div className={`flex items-center justify-center ${isDashboardView ? 'h-full' : 'min-h-screen bg-gray-50'}`}>
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`${isDashboardView ? 'w-full' : 'min-h-screen bg-gray-50 flex flex-col relative overflow-x-hidden'}`}>
            {/* Logo Top Left - Only show on standalone page */}
            {!isDashboardView && (
                <div className="absolute top-6 left-6 z-20">
                    <Link
                        to="/"
                        className="flex items-center space-x-2 p-1 group"
                    >
                        <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            T
                        </div>
                        <span className="text-xl font-bold text-gray-800 hidden sm:block">
                            Triple Portion
                        </span>
                    </Link>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-grow flex flex-col items-center ${isDashboardView ? 'py-4' : 'justify-center px-4 py-20'}`}>
                <div className={`w-full ${isDashboardView ? '' : 'max-w-4xl'}`}>
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className={`${isDashboardView ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
                            Vendor Onboarding
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Follow the steps to set up your store
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-10 px-4">
                        <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} variant="minimal" />
                    </div>

                    {/* Sliding Form Container */}
                    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[500px]`}>
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 }
                                }}
                                className="w-full"
                            >
                                {renderForm()}
                            </motion.div>
                        </AnimatePresence>

                        {/* Submit Corrections Overlay for Action Required Status */}
                        {vendor?.status === 'Action Required' && (
                            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
                                    <Loader2 className="animate-spin hidden" size={20} id="submit-loader" />
                                    <p className="text-sm font-bold">Finished making your corrections?</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        const loader = document.getElementById('submit-loader');
                                        if (loader) loader.classList.remove('hidden');
                                        const success = await useVendorStore.getState().submitCorrections();
                                        if (success) {
                                            await useAuthStore.getState().checkAuth();
                                            onComplete();
                                        }
                                        if (loader) loader.classList.add('hidden');
                                    }}
                                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all transform active:scale-95 text-sm cursor-pointer flex items-center gap-2"
                                >
                                    Submit Final Corrections
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorOnboardingForm;
