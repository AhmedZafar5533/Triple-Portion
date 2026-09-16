import { useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useVendorStore } from '../../store/vendorStore';
import { TrendingUp, ShoppingBag, DollarSign, Users, Camera, User, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const BACKEND_URL = API_BASE_URL;

const SellerOverview = () => {
  const { user, checkAuth, uploadProfilePic, loading } = useAuthStore();
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }
    const result = await uploadProfilePic(file);
    if (result) await checkAuth();
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const profilePicUrl = getImageUrl(user?.profilePic);

  const stats = [
    { label: 'Total Sales', value: '$0.00', icon: <DollarSign size={24} />, color: 'bg-emerald-500' },
    { label: 'Active Orders', value: '0', icon: <ShoppingBag size={24} />, color: 'bg-blue-500' },
    { label: 'Total Customers', value: '0', icon: <Users size={24} />, color: 'bg-indigo-500' },
    { label: 'Revenue Growth', value: '0%', icon: <TrendingUp size={24} />, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.username}!</h1>
          <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your store today.</p>
        </div>

        {/* Quick Profile Section */}
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 pr-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="relative group">
            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200 dark:border-gray-600">
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={24} />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Store Manager</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Sales Data Yet</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Start listing your products to see your sales and performance metrics here.
        </p>
      </div>
    </div>
  );
};

export default SellerOverview;
