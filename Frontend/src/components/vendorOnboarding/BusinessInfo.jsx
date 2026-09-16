import { useState, useEffect } from "react";
import { useVendorStore } from "../../store/vendorStore";
import { useServiceStore } from "../../store/serviceStore";
import { Loader2 } from "lucide-react";

const BusinessInformation = ({ nextStep, currentStep, totalSteps }) => {
  const { vendor, loading, saveStep } = useVendorStore();

  const {
    frontEndServices,
    fetchFrontendServices,
    loading: servicesLoading,
  } = useServiceStore();

  useEffect(() => {
    fetchFrontendServices();
  }, [fetchFrontendServices]);

  const [formData, setFormData] = useState({
    businessName: "",
    legalBusinessName: "",
    businessType: "",
    businessIndustry: "",
    registrationNumber: "",
  });

  const [errors, setErrors] = useState({});

  // Populate from vendor data
  useEffect(() => {
    if (vendor?.businessDetails) {
      const d = vendor.businessDetails;
      setFormData({
        businessName: d.businessName || "",
        legalBusinessName: d.legalBusinessName || "",
        businessType: d.businessType || "",
        businessIndustry: d.businessIndustry || "",
        registrationNumber: d.registrationNumber || "",
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
    if (!formData.businessName || formData.businessName.length < 2)
      errs.businessName = "Business name must be at least 2 characters.";
    if (!formData.legalBusinessName || formData.legalBusinessName.length < 2)
      errs.legalBusinessName = "Legal business name must be at least 2 characters.";
    if (!formData.businessType) errs.businessType = "Please select a business type.";
    if (!formData.businessIndustry) errs.businessIndustry = "Please select an industry.";
    if (!formData.registrationNumber || !/^[a-zA-Z0-9]{5,20}$/.test(formData.registrationNumber))
      errs.registrationNumber = "Must be 5-20 alphanumeric characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check for changes
    const hasChanged = !vendor?.businessDetails ||
      Object.keys(formData).some(key => formData[key] !== vendor.businessDetails[key]);

    if (!hasChanged) {
      console.log("No changes in Business Info, skipping save.");
      nextStep();
      return;
    }

    const success = await saveStep(1, formData);
    if (success) nextStep();
  };

  const inputClass = (field) =>
    `w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition ${errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Business Name *</label>
        <input name="businessName" value={formData.businessName} onChange={handleChange}
          className={inputClass("businessName")} placeholder="Enter your business name" />
        {errors.businessName && <p className="text-red-500 text-sm">{errors.businessName}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Legal Business Name *</label>
        <input name="legalBusinessName" value={formData.legalBusinessName} onChange={handleChange}
          className={inputClass("legalBusinessName")} placeholder="Enter legal business name" />
        {errors.legalBusinessName && <p className="text-red-500 text-sm">{errors.legalBusinessName}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Business Type *</label>
        <select name="businessType" value={formData.businessType} onChange={handleChange}
          className={inputClass("businessType")}>
          <option value="">Select Business Type</option>
          <option value="Sole Proprietorship">Sole Proprietorship</option>
          <option value="Partnership">Partnership</option>
          <option value="LLC">LLC</option>
          <option value="Corporation">Corporation</option>
          <option value="Other">Other</option>
          <option value="Custom">Custom</option>
        </select>
        {errors.businessType && <p className="text-red-500 text-sm">{errors.businessType}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Business Industry *</label>
        <select name="businessIndustry" value={formData.businessIndustry} onChange={handleChange}
          className={inputClass("businessIndustry")}>
          <option value="">Select industry</option>
          
          {servicesLoading ? (
            <option disabled>Loading services...</option>
          ) : frontEndServices?.length > 0 ? (
            frontEndServices.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))
          ) : (
            <option disabled>No services available. Please contact support.</option>
          )}
        </select>
        {errors.businessIndustry && <p className="text-red-500 text-sm">{errors.businessIndustry}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Registration Number *</label>
        <input name="registrationNumber" value={formData.registrationNumber} onChange={handleChange}
          className={inputClass("registrationNumber")} placeholder="Business registration number" />
        {errors.registrationNumber && <p className="text-red-500 text-sm">{errors.registrationNumber}</p>}
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
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

export default BusinessInformation;
