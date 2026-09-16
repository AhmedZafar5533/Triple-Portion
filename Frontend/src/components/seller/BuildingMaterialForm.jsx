import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { 
    X, Plus, Tag, Ruler, HardHat, Info, 
    ArrowLeft, Save, Camera, AlertCircle, Hammer,
    PaintBucket, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { IMG_BASE_URL } from '../../config';


const ErrorMsg = ({ message }) => (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 mt-2 px-2">
        <AlertCircle size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{message}</span>
    </motion.div>
);

const BuildingMaterialForm = ({ product = null, onCancel, onComplete }) => {
    const { addProduct, updateProduct, loading } = useProductStore();
    const isEdit = !!product;

    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        discountedPrice: product?.discountedPrice || '',
        description: product?.description || '',
        stock: product?.stock || 1,
        category: 'Building Material / Plumbing',
        materialType: product?.materialType || '',
        dimensions: product?.dimensions || '',
        grade: product?.grade || '',
        weightPerUnit: product?.weightPerUnit || '',
        color: product?.color || '',
        usage: product?.usage || '',
        brand: product?.brand || '',
        tags: product?.tags || []
    });

    const predefinedTypes = ["Cement", "Steel/Rebar", "Plumbing/Pipes", "Electrical", "Tiles/Flooring", "Timber/Wood", "Roofing", "Paint", "Hardware"];
    const initialMaterialType = product?.materialType || '';
    const isCustomInitial = initialMaterialType && !predefinedTypes.includes(initialMaterialType);

    const [materialTypeSelect, setMaterialTypeSelect] = useState(
        isCustomInitial ? 'Other' : initialMaterialType
    );
    const [customMaterialType, setCustomMaterialType] = useState(
        isCustomInitial ? initialMaterialType : ''
    );

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [deletedImages, setDeletedImages] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => { const up = { ...prev }; delete up[name]; return up; });
    };

    const handleSelectChange = (e) => {
        const val = e.target.value;
        setMaterialTypeSelect(val);
        if (val === 'Other') {
            setFormData(prev => ({ ...prev, materialType: customMaterialType }));
        } else {
            setFormData(prev => ({ ...prev, materialType: val }));
            if (errors.materialType) setErrors(prev => { const up = { ...prev }; delete up.materialType; return up; });
        }
    };

    const handleCustomInputChange = (e) => {
        const val = e.target.value;
        setCustomMaterialType(val);
        setFormData(prev => ({ ...prev, materialType: val }));
        if (errors.materialType) setErrors(prev => { const up = { ...prev }; delete up.materialType; return up; });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + existingImages.length + files.length > 5) {
            return toast.error("Maximum 5 images allowed");
        }
        setImages(prev => [...prev, ...files]);
    };

    const removeNewImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (url) => {
        setExistingImages(prev => prev.filter(img => img !== url));
        setDeletedImages(prev => [...prev, url]);
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (formData.tags.length >= 5) return toast.error("Max 5 tags allowed");
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                if (errors.tags) setErrors(prev => { const up = { ...prev }; delete up.tags; return up; });
            }
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Product name is required";
        if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Enter valid price";
        if (formData.discountedPrice && Number(formData.discountedPrice) >= Number(formData.price)) newErrors.discountedPrice = "Must be less than price";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.materialType) newErrors.materialType = "Material type is required";
        if (!formData.stock || Number(formData.stock) < 1) newErrors.stock = "Stock must be at least 1";
        if (formData.tags.length === 0) newErrors.tags = "At least one SEO tag is required";
        if (existingImages.length + images.length === 0) newErrors.images = "At least one photo required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return toast.error("Please fix form errors");

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'tags') {
                data.append(key, JSON.stringify(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        images.forEach(img => data.append('images', img));
        if (isEdit) data.append('deletedImages', JSON.stringify(deletedImages));

        const success = isEdit 
            ? await updateProduct(product._id, data)
            : await addProduct(data);

        if (success) onComplete();
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 mb-8">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={24}/></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {isEdit ? "Update Material" : "Add Building Material"}
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                            {isEdit ? `Editing: ${product.name}` : "Materials & Plumbing Builder"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 mb-2"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Hammer size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Product Basics</h2></div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Product Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.name ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold text-lg`} placeholder="e.g., Premium Portland Cement" />
                                {errors.name && <ErrorMsg message={errors.name} />}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Price (UGX)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.price ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold`} placeholder="0" />
                                    {errors.price && <ErrorMsg message={errors.price} />}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Discount Price</label>
                                    <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.discountedPrice ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold`} placeholder="Optional" />
                                    {errors.discountedPrice && <ErrorMsg message={errors.discountedPrice} />}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Material Type</label>
                                    <select name="materialTypeSelect" value={materialTypeSelect} onChange={handleSelectChange} className={`w-full px-4 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 ${errors.materialType ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold text-xs uppercase`}>
                                        <option value="">Select Type</option>
                                        <option value="Cement">Cement</option>
                                        <option value="Steel/Rebar">Steel / Rebar</option>
                                        <option value="Plumbing/Pipes">Plumbing / Pipes</option>
                                        <option value="Electrical">Electrical Materials</option>
                                        <option value="Tiles/Flooring">Tiles / Flooring</option>
                                        <option value="Timber/Wood">Timber / Wood</option>
                                        <option value="Roofing">Roofing Materials</option>
                                        <option value="Paint">Paint & Coatings</option>
                                        <option value="Hardware">General Hardware</option>
                                        <option value="Other">Other (Custom Type)</option>
                                    </select>
                                    {materialTypeSelect === 'Other' && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                                            <input 
                                                type="text" 
                                                placeholder="Enter custom material type..." 
                                                value={customMaterialType} 
                                                onChange={handleCustomInputChange} 
                                                className={`w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.materialType ? 'border-red-500/30' : 'border-transparent'} rounded-[1.2rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold text-xs`}
                                            />
                                        </motion.div>
                                    )}
                                    {errors.materialType && <ErrorMsg message={errors.materialType} />}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Initial Stock</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.stock ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold`} placeholder="1" min="1" />
                                    {errors.stock && <ErrorMsg message={errors.stock} />}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Full Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.description ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium resize-none`} placeholder="Product details, usage instructions, and safety info..." />
                                {errors.description && <ErrorMsg message={errors.description} />}
                            </div>
                        </div>
                    </section>

                    {/* Technical Specs */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 mb-2"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Ruler size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Technical Specifications</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Dimensions / Size</label>
                                <input type="text" name="dimensions" value={formData.dimensions} onChange={handleInputChange} className="w-full px-7 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-medium dark:text-white" placeholder="e.g. 50kg, 20ft, 12mm" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Grade / Quality</label>
                                <input type="text" name="grade" value={formData.grade} onChange={handleInputChange} className="w-full px-7 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-medium dark:text-white" placeholder="e.g. Grade 42.5, Class B" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Weight Per Unit</label>
                                <input type="text" name="weightPerUnit" value={formData.weightPerUnit} onChange={handleInputChange} className="w-full px-7 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-medium dark:text-white" placeholder="e.g. 50kg bag" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Color / Finish</label>
                                <input type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full px-7 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl outline-none font-medium dark:text-white" placeholder="e.g. Grey, White, Polished" />
                            </div>
                        </div>
                    </section>

                    {/* Gallery */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Camera size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Product Gallery</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {existingImages.map((url, i) => (
                                <div key={i} className="relative h-48 rounded-[2rem] overflow-hidden group shadow-lg">
                                    <img src={`${IMG_BASE_URL}${url}`} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-xl text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-500 hover:text-white"><X size={16} /></button>
                                </div>
                            ))}
                            {images.map((file, i) => (
                                <div key={i} className="relative h-48 rounded-[2rem] overflow-hidden group shadow-lg">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-xl text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-500 hover:text-white"><X size={16} /></button>
                                </div>
                            ))}
                            {existingImages.length + images.length < 5 && (
                                <label className="h-48 border-4 border-dashed border-gray-100 dark:border-gray-700 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-all group">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add Photo</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                        {errors.images && <ErrorMsg message={errors.images} />}
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Additional Details */}
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><HardHat size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider dark:text-white">Manufacturer Info</h2></div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Brand Name</label>
                                <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. Hima, Simba, Roofings" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Primary Usage</label>
                                <input type="text" name="usage" value={formData.usage} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. Heavy Construction, Indoor Plumbing" />
                            </div>
                        </div>
                    </section>

                    {/* SEO Tags */}
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Tag size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider dark:text-white">SEO Tags</h2></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.tags.length}/5</span>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="Press Enter to add tag" />
                            {errors.tags && <ErrorMsg message={errors.tags} />}
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 rounded-xl uppercase tracking-wider">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)}><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <button type="submit" disabled={loading} className={`w-full py-5 ${isEdit ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'} text-white font-bold rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer group`}>
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isEdit ? <Save size={24} /> : <Plus size={24} />}<span>{isEdit ? "Update Material" : "Publish Material"}</span></>}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default BuildingMaterialForm;
