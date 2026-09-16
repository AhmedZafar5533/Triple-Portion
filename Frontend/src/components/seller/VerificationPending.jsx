import React from 'react';
import { Clock, FileCheck, Shield } from 'lucide-react';

const VerificationPending = () => {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Animated Clock Icon */}
          <div className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Verification In Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            Your vendor application has been submitted and is currently under review by our team.
            This usually takes 1-3 business days.
          </p>

          <div className="space-y-4 text-left bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Application Submitted</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">All your details have been received</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Under Review</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Our team is verifying your information</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-400 dark:text-gray-500 text-sm">Verification Complete</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Pending admin approval</p>
              </div>
            </div>
          </div>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
            You'll be notified once the review is complete. In the meantime, you can still access your profile.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
