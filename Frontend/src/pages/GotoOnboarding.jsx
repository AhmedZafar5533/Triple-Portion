import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorOnboardingPage = ({ isDashboardView = false }) => {
    useEffect(() => {
        document.title = "Onboarding | Triple Portion";
    }, []);

    const content = (
        <div className={`${isDashboardView ? '' : 'min-h-screen bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50/30'} flex items-center justify-center p-4`}>
            <div className={`max-w-3xl w-full bg-white rounded-xl ${isDashboardView ? 'shadow-sm' : 'shadow-lg'} border border-gray-100 overflow-hidden`}>
                <div className="flex flex-col md:flex-row">
                    {/* Left side with illustration */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-8 md:w-2/5 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Vendor Portal</h2>
                            <div className="mb-6">
                                <svg className="w-40 h-40 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
                                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-blue-100">Join our network of trusted vendors</p>
                        </div>
                    </div>

                    {/* Right side with content */}
                    <div className="p-8 md:w-3/5">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Vendor Onboarding</h1>
                        <p className="text-gray-600 mb-6">Complete your profile to access all vendor features</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                                <p className="text-gray-700">Manage your services catalog</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                                <p className="text-gray-700">Track orders and payments</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                                <p className="text-gray-700">Access performance analytics</p>
                            </div>
                        </div>

                        <Link to={'/onboarding'}>
                            <button
                                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center shadow-lg shadow-blue-100 cursor-pointer"
                            >
                                Begin Onboarding
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </Link>
                        <p className="text-center text-gray-500 text-sm mt-4">
                            Need help? <Link to={'/about'} className="text-blue-600 hover:text-blue-700 font-medium">Contact support</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isDashboardView) return content;

    return content;
};

export default VendorOnboardingPage;
