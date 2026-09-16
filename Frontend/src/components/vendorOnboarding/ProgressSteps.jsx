const ProgressSteps = ({ currentStep, totalSteps, variant = "standard" }) => {
    if (variant === "minimal") {
        return (
            <div className="w-full">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-600">Step {currentStep} of {totalSteps}</span>
                    <span className="text-sm font-medium text-gray-500">
                        {currentStep === 1 && 'Business Details'}
                        {currentStep === 2 && 'Contact Information'}
                        {currentStep === 3 && 'Owner Verification'}
                        {currentStep === 4 && 'Contact Person'}
                        {currentStep === 5 && 'Business Address'}
                    </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-2">
            <div className="flex items-center justify-between relative">
                {/* Progress Bar */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                    ></div>
                </div>

                {/* Step circles */}
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <div key={step} className="flex flex-col items-center relative z-10">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${currentStep === step
                                    ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                                    : currentStep > step
                                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-400'
                                }`}
                        >
                            {currentStep > step ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span className="text-sm font-semibold">{step}</span>
                            )}
                        </div>
                        <span className={`text-xs mt-2 font-medium hidden sm:block ${
                            currentStep === step ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                            {step === 1 && 'Business'}
                            {step === 2 && 'Contact'}
                            {step === 3 && 'Owner'}
                            {step === 4 && 'Person'}
                            {step === 5 && 'Address'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressSteps;
