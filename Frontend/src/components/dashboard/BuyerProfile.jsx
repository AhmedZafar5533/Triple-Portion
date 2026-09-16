import React, { useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Shield, Calendar, Camera, CheckCircle, Loader2, MapPin, Phone } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const BACKEND_URL = API_BASE_URL;

const BuyerProfile = () => {
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
      await checkAuth();
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const profilePicUrl = getImageUrl(user?.profilePic);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Profile Header/Cover */}
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="px-8 pb-8">
          <div className="relative -mt-16 flex items-end justify-between mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] bg-white dark:bg-gray-800 p-1.5 shadow-xl">
                <div className="w-full h-full rounded-[1.75rem] bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
              </div>
              <button
                onClick={handleProfilePicClick}
                disabled={loading}
                className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-xl shadow-lg border-2 border-white dark:border-gray-800 hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
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

            <div className="flex gap-2">
               <span className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                 <CheckCircle size={14} /> {user?.role} Account
               </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize tracking-tight">
              {user?.username}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
              <Mail size={16} className="text-blue-500" />
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
            <Shield size={20} className="text-blue-500" />
            Account Security
          </h2>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email Verification</label>
              <div className="flex items-center gap-2 mt-1">
                 <div className={`w-2 h-2 rounded-full ${user?.otpVerified ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                 <p className="text-gray-900 dark:text-white font-bold text-sm">
                   {user?.otpVerified ? 'Verified ✓' : 'Not Verified ✗'}
                 </p>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Account Type</label>
              <p className="text-gray-900 dark:text-white font-bold text-sm capitalize mt-1">{user?.role}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">User ID</label>
              <p className="text-gray-400 dark:text-gray-500 font-mono text-[10px] mt-1">{user?._id}</p>
            </div>
          </div>
        </div>

        {/* Activity & Stats */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
            <Calendar size={20} className="text-indigo-500" />
            Activity
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Member Since</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
               <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                 You are currently using the Buyer portal. You can browse products, place orders, and track your shipments.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
