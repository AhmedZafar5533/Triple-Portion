import { useState, useEffect } from "react";
import { useVendorStore } from "../../store/vendorStore";
import { Loader2, Upload, X } from "lucide-react";
import { API_BASE_URL } from "../../config";

const BACKEND_URL = API_BASE_URL;

const OwnerInformation = ({ nextStep, prevStep, currentStep, totalSteps }) => {
  const { vendor, loading, saveStep, deleteImage } = useVendorStore();

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    nationality: "",
    identificationType: "",
    identificationNumber: "",
  });

  const [ownerPhoto, setOwnerPhoto] = useState(null);
  const [ownerDocPhoto, setOwnerDocPhoto] = useState(null);
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState("");
  const [ownerDocPreview, setOwnerDocPreview] = useState("");
  const [errors, setErrors] = useState({});

  // Helper to construct full image URL
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    // Ensure no double slashes
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  // Populate from vendor data
  useEffect(() => {
    if (vendor?.ownerDetails) {
      const d = vendor.ownerDetails;
      setFormData({
        name: d.name || "",
        dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth).toISOString().split("T")[0] : "",
        nationality: d.nationality || "",
        identificationType: d.identificationType || "",
        identificationNumber: d.identificationNumber || "",
      });
      
      // Only set from DB if we don't have a new file currently selected
      if (d.ownerPhoto && !ownerPhoto) setOwnerPhotoPreview(getImageUrl(d.ownerPhoto));
      if (d.ownerDocumentPhoto && !ownerDocPhoto) setOwnerDocPreview(getImageUrl(d.ownerDocumentPhoto));
    }
  }, [vendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [type]: "File size must be less than 5MB." }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, [type]: "Only image files are allowed." }));
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === "ownerPhoto") {
      setOwnerPhoto(file);
      setOwnerPhotoPreview(previewUrl);
    } else {
      setOwnerDocPhoto(file);
      setOwnerDocPreview(previewUrl);
    }
    if (errors[type]) setErrors((prev) => ({ ...prev, [type]: "" }));
  };

  const handleDeleteImage = async (type) => {
    // If it's a previously saved image, delete from backend
    const fieldName = type === "ownerPhoto" ? "ownerPhoto" : "ownerDocumentPhoto";
    if (vendor?.ownerDetails?.[fieldName]) {
      const success = await deleteImage(fieldName);
      if (!success) return;
    }

    // Clear local state
    if (type === "ownerPhoto") {
      setOwnerPhoto(null);
      setOwnerPhotoPreview("");
    } else {
      setOwnerDocPhoto(null);
      setOwnerDocPreview("");
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.length < 3 || !/^[a-zA-Z\s]+$/.test(formData.name))
      errs.name = "Name must be at least 3 characters (letters/spaces only).";
    if (!formData.dateOfBirth) {
      errs.dateOfBirth = "Date of birth is required.";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) errs.dateOfBirth = "Owner must be at least 18 years old.";
    }
    if (!formData.nationality || formData.nationality.length < 2)
      errs.nationality = "Nationality is required.";
    if (!formData.identificationType) errs.identificationType = "Please select an ID type.";
    if (!formData.identificationNumber || formData.identificationNumber.length < 4)
      errs.identificationNumber = "ID number must be at least 4 characters.";

    // Require photos only if none were previously uploaded
    if (!ownerPhoto && !vendor?.ownerDetails?.ownerPhoto)
      errs.ownerPhoto = "Owner photo is required.";
    if (!ownerDocPhoto && !vendor?.ownerDetails?.ownerDocumentPhoto)
      errs.ownerDocumentPhoto = "Identity document photo is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check for changes
    const hasDataChanged = !vendor?.ownerDetails || 
      Object.keys(formData).some(key => {
        if (key === 'dateOfBirth') {
          const vDate = vendor.ownerDetails[key] ? new Date(vendor.ownerDetails[key]).toISOString().split("T")[0] : "";
          return formData[key] !== vDate;
        }
        return formData[key] !== vendor.ownerDetails[key];
      });
    
    const hasPhotosChanged = !!ownerPhoto || !!ownerDocPhoto;

    if (!hasDataChanged && !hasPhotosChanged) {
      console.log("No changes in Owner Info, skipping save.");
      nextStep();
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("dateOfBirth", formData.dateOfBirth);
    fd.append("nationality", formData.nationality);
    fd.append("identificationType", formData.identificationType);
    fd.append("identificationNumber", formData.identificationNumber);
    if (ownerPhoto) {
      fd.append("ownerPhoto", ownerPhoto);
    } else if (ownerPhotoPreview === "") {
      fd.append("ownerPhoto", ""); // Explicitly signal deletion
    }

    if (ownerDocPhoto) {
      fd.append("ownerDocumentPhoto", ownerDocPhoto);
    } else if (ownerDocPreview === "") {
      fd.append("ownerDocumentPhoto", ""); // Explicitly signal deletion
    }

    const success = await saveStep(3, fd);
    if (success) nextStep();
  };

  const inputClass = (field) =>
    `w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition ${
      errors[field] ? "border-red-400" : "border-gray-200"
    }`;

  const renderFileInput = (label, type, preview) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label} *</label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border border-gray-200" />
          <button type="button" onClick={() => handleDeleteImage(type)} 
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-gray-500 text-sm">Click to upload (max 5MB)</span>
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange(e, type)} />
        </label>
      )}
      {errors[type] && <p className="text-red-500 text-sm">{errors[type]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Owner Name *</label>
        <input name="name" value={formData.name} onChange={handleChange}
          className={inputClass("name")} placeholder="Full name of owner" />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Date of Birth *</label>
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
          className={inputClass("dateOfBirth")} />
        {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Nationality *</label>
        <input name="nationality" value={formData.nationality} onChange={handleChange}
          className={inputClass("nationality")} placeholder="e.g., American" />
        {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Identification Type *</label>
        <select name="identificationType" value={formData.identificationType} onChange={handleChange}
          className={inputClass("identificationType")}>
          <option value="">Select ID Type</option>
          <option value="Passport">Passport</option>
          <option value="Driver's License">Driver's License</option>
          <option value="National ID">National ID</option>
        </select>
        {errors.identificationType && <p className="text-red-500 text-sm">{errors.identificationType}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700">Identification Number *</label>
        <input name="identificationNumber" value={formData.identificationNumber} onChange={handleChange}
          className={inputClass("identificationNumber")} placeholder="Enter ID number" />
        {errors.identificationNumber && <p className="text-red-500 text-sm">{errors.identificationNumber}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {renderFileInput("Owner Photo", "ownerPhoto", ownerPhotoPreview)}
        {renderFileInput("Identity Document", "ownerDocumentPhoto", ownerDocPreview)}
      </div>

      <p className="text-sm text-gray-500 italic">
        Note: The owner photo and identity document must belong to the same person.
      </p>

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

export default OwnerInformation;
