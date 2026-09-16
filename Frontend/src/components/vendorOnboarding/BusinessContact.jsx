import { useState, useEffect } from "react";
import { useVendorStore } from "../../store/vendorStore";
import { Loader2 } from "lucide-react";

const BusinessContact = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const { vendor, loading, saveStep } = useVendorStore();

  const [formData, setFormData] = useState({
    businessEmail: "",
    businessPhone: "",
    website: "",
  });
  const [errors, setErrors] = useState({});

  // Populate from vendor data
  useEffect(() => {
    if (vendor?.businessContact) {
      const d = vendor.businessContact;
      setFormData({
        businessEmail: d.businessEmail || "",
        businessPhone: d.businessPhone || "",
        website: d.website || "",
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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;

    if (!formData.businessEmail || !emailRegex.test(formData.businessEmail))
      errs.businessEmail = "Enter a valid email address.";
    if (!formData.businessPhone || !phoneRegex.test(formData.businessPhone))
      errs.businessPhone = "Enter a valid phone number (7-20 digits).";
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website))
      errs.website = "Enter a valid URL (e.g., https://example.com).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check for changes
    const hasChanged = !vendor?.businessContact || 
      Object.keys(formData).some(key => formData[key] !== vendor.businessContact[key]);

    if (!hasChanged) {
      nextStep();
      return;
    }

    const success = await saveStep(2, formData);
    if (success) nextStep();
  };

  const inputClass = (field) =>
    `w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Business Email *</label>
        <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange}
          className={inputClass("businessEmail")} placeholder="info@yourbusiness.com" />
        {errors.businessEmail && <p className="text-red-500 text-sm">{errors.businessEmail}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Business Phone *</label>
        <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleChange}
          className={inputClass("businessPhone")} placeholder="+1 (555) 123-4567" />
        {errors.businessPhone && <p className="text-red-500 text-sm">{errors.businessPhone}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Website <span className="text-gray-400 font-normal">(Optional)</span></label>
        <input type="url" name="website" value={formData.website} onChange={handleChange}
          className={inputClass("website")} placeholder="https://www.yourbusiness.com" />
        {errors.website && <p className="text-red-500 text-sm">{errors.website}</p>}
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
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Continue
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default BusinessContact;
