import { useState, useEffect } from "react";
import { useVendorStore } from "../../store/vendorStore";
import { Loader2 } from "lucide-react";

const ContactPerson = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const { vendor, loading, saveStep } = useVendorStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });
  const [errors, setErrors] = useState({});

  // Populate from vendor data
  useEffect(() => {
    if (vendor?.contactPerson) {
      const d = vendor.contactPerson;
      setFormData({
        name: d.name || "",
        email: d.email || "",
        phone: d.phone || "",
        position: d.position || "",
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
    if (!formData.name || formData.name.length < 3)
      errs.name = "Contact name must be at least 3 characters.";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Enter a valid email address.";
    if (!formData.phone || !/^\+?[\d\s\-().]{7,20}$/.test(formData.phone))
      errs.phone = "Enter a valid phone number.";
    if (!formData.position || formData.position.length < 2)
      errs.position = "Position must be at least 2 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check for changes
    const hasChanged = !vendor?.contactPerson || 
      Object.keys(formData).some(key => formData[key] !== vendor.contactPerson[key]);

    if (!hasChanged) {
      nextStep();
      return;
    }

    const success = await saveStep(4, formData);
    if (success) nextStep();
  };

  const inputClass = (field) =>
    `w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Contact Person Name *</label>
        <input name="name" value={formData.name} onChange={handleChange}
          className={inputClass("name")} placeholder="Full name" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange}
          className={inputClass("email")} placeholder="contact@yourbusiness.com" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Phone *</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
          className={inputClass("phone")} placeholder="+1 (555) 123-4567" />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Position / Title *</label>
        <input name="position" value={formData.position} onChange={handleChange}
          className={inputClass("position")} placeholder="e.g., Operations Manager" />
        {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
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

export default ContactPerson;
