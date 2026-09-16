import React, { useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useVendorStore } from '../../store/vendorStore';
import { User, Mail, Shield, Calendar, Camera, CheckCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const BACKEND_URL = API_BASE_URL;

const SellerProfile = () => {
  const { user, checkAuth, uploadProfilePic, loading } = useAuthStore();
  const fileInputRef = useRef(null);

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    const result = await uploadProfilePic(file);
    if (result) {
      // Refresh auth state to get updated profilePic

      await checkAuth();
    }
  };

  const isVerified = user?.onboardingStatus === 'verified';
  const isCompleted = user?.onboardingStatus === 'completed';

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const profilePicUrl = getImageUrl(user?.profilePic);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Profile Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex items-end justify-between mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
              </div>
              <button
                onClick={handleProfilePicClick}
                disabled={loading}
                className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Verified Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isVerified
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              }`}>
              <CheckCircle size={16} className={isVerified ? '' : 'opacity-40'} />
              {isVerified ? 'Verified' : isCompleted ? 'Pending Verification' : 'Not Verified'}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {user?.username}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Mail size={16} />
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-blue-500" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Role</label>
              <p className="text-gray-900 dark:text-white font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Onboarding Status</label>
              <div className="mt-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${user?.onboardingStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : user?.onboardingStatus === 'completed'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                  {user?.onboardingStatus}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">OTP Verification</label>
              <p className="text-gray-900 dark:text-white font-medium">
                {user?.otpVerified ? 'Verified ✓' : 'Not Verified ✗'}
              </p>
            </div>
          </div>
        </div>

        {/* Platform Usage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Member Since
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Your account was successfully created. {
                user?.onboardingStatus === 'verified'
                  ? 'Your vendor status is verified — you can start selling!'
                  : 'Please ensure your onboarding is complete to start listing products.'
              }
            </p>
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Last Login: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
