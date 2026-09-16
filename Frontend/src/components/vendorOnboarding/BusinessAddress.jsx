import { useState, useEffect } from "react";
import { useVendorStore } from "../../store/vendorStore";
import { useAuthStore } from "../../store/authStore";
import { Loader2, CheckCircle } from "lucide-react";

const BusinessAddress = ({ prevStep, currentStep, totalSteps, onComplete }) => {
  const { vendor, loading, saveStep } = useVendorStore();
  const { checkAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [errors, setErrors] = useState({});

  // Populate from vendor data
  useEffect(() => {
    if (vendor?.businessAddress) {
      const d = vendor.businessAddress;
      setFormData({
        street: d.street || "",
        city: d.city || "",
        state: d.state || "",
        postalCode: d.postalCode || "",
        country: d.country || "",
      });
    }
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.street || formData.street.length < 5)
      errs.street = "Street address must be at least 5 characters.";
    if (!formData.city || formData.city.length < 2) errs.city = "City is required.";
    if (!formData.state || formData.state.length < 2) errs.state = "State/Province is required.";
    if (!formData.postalCode || formData.postalCode.length < 3)
      errs.postalCode = "Postal code must be at least 3 characters.";
    if (!formData.country || formData.country.length < 2) errs.country = "Country is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Always call saveStep for the final step to ensure onboardingStatus is updated to 'completed'
    // even if no address fields were changed in this interaction.
    const success = await saveStep(5, formData);
    if (success) {
      // Refresh user auth state to get updated onboardingStatus
      await checkAuth();
      if (onComplete) onComplete();
    }
  };

  const inputClass = (field) =>
    `w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Street Address *</label>
        <input name="street" value={formData.street} onChange={handleChange}
          className={inputClass("street")} placeholder="123 Main Street, Suite 100" />
        {errors.street && <p className="text-red-500 text-sm">{errors.street}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">City *</label>
          <input name="city" value={formData.city} onChange={handleChange}
            className={inputClass("city")} placeholder="New York" />
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">State / Province *</label>
          <input name="state" value={formData.state} onChange={handleChange}
            className={inputClass("state")} placeholder="New York" />
          {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Postal Code *</label>
          <input name="postalCode" value={formData.postalCode} onChange={handleChange}
            className={inputClass("postalCode")} placeholder="10001" />
          {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Country *</label>
          <input name="country" value={formData.country} onChange={handleChange}
            className={inputClass("country")} placeholder="United States" />
          {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button type="button" onClick={prevStep}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center gap-2 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button type="submit" disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Complete Registration
        </button>
      </div>
    </form>
  );
};

export default BusinessAddress;
