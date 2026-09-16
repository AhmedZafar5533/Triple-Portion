import React, { useState, useRef } from 'react';
import { 
    Plus, 
    Upload, 
    X, 
    Check, 
    Package,
    Tag as TagIcon,
    Cpu,
    Settings,
    Layers,
    Layout,
    AlertTriangle,
    Shield,
    ListChecks,
    Activity,
    ArrowLeft,
    Save
} from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { IMG_BASE_URL } from '../../config';


const ErrorMsg = ({ message }) => (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/10 rounded-lg">
        <AlertTriangle size={10} className="text-red-500" />
        <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">{message}</span>
    </motion.div>
);

const ElectronicsForm = ({ product = null, onCancel, onComplete }) => {
    const { addProduct, updateProduct, loading } = useProductStore();
    const isEdit = !!product;

    const [images, setImages] = useState([]); // New images
    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [deletedImages, setDeletedImages] = useState([]);
    
    const [tagInput, setTagInput] = useState('');
    const [warrantyRuleInput, setWarrantyRuleInput] = useState('');
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    // Everything defaults to Electronics category

    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        discountedPrice: product?.discountedPrice || '',
        description: product?.description || '',
        stock: product?.stock || 0,
        category: product?.category || 'Electronics',
        brand: product?.brand || '',
        modelNumber: product?.modelNumber || '',
        condition: product?.condition || 'New',
        warranty: product?.warranty || {
            hasWarranty: false,
            duration: '',
            type: 'Manufacturer',
            conditions: []
        },
        specifications: product?.specifications || [{ label: '', value: '' }],
        features: product?.features || [''],
        tags: product?.tags || [],
        energyRating: product?.energyRating || '',
        capacity: product?.capacity || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => { const up = { ...prev }; delete up[name]; return up; });
    };

    const handleWarrantyChange = (field, value) => {
        setFormData(prev => ({ ...prev, warranty: { ...prev.warranty, [field]: value } }));
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (formData.tags.length >= 5) return toast.error("Maximum 5 tags allowed");
            if (formData.tags.includes(tagInput.trim())) return setTagInput('');
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const addWarrantyRule = (e) => {
        if (e.key === 'Enter' && warrantyRuleInput.trim()) {
            e.preventDefault();
            setFormData(prev => ({ ...prev, warranty: { ...prev.warranty, conditions: [...prev.warranty.conditions, warrantyRuleInput.trim()] } }));
            setWarrantyRuleInput('');
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (existingImages.length + images.length + files.length > 5) return toast.error("Max 5 images");
        const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) return toast.error("Max 5MB per image");

        setImages([...images, ...files]);
    };

    const removeExistingImage = (url) => {
        setExistingImages(prev => prev.filter(img => img !== url));
        setDeletedImages(prev => [...prev, url]);
    };

    const removeNewImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name || formData.name.length < 3) newErrors.name = "Title too short";
        if (formData.price === '' || Number(formData.price) <= 0) newErrors.price = "Enter valid price";
        if (formData.discountedPrice && Number(formData.discountedPrice) >= Number(formData.price)) newErrors.discountedPrice = "Must be less than price";
        if (!formData.description || formData.description.length < 10) newErrors.description = "More details needed";
        if (!formData.stock || Number(formData.stock) < 1) newErrors.stock = "Stock must be at least 1";
        if (existingImages.length + images.length === 0) newErrors.images = "At least one photo required";
        if (formData.tags.length === 0) newErrors.tags = "At least one SEO tag is required";
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fix the highlighted errors");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. If editing, check if anything changed before sending request
        if (isEdit) {
            const hasDataChanged = 
                String(formData.name).trim() !== String(product.name).trim() ||
                Number(formData.price) !== Number(product.price) ||
                Number(formData.discountedPrice || 0) !== Number(product.discountedPrice || 0) ||
                String(formData.description).trim() !== String(product.description).trim() ||
                Number(formData.stock) !== Number(product.stock) ||
                formData.category !== product.category ||
                (formData.brand || '') !== (product.brand || '') ||
                formData.condition !== (product.condition || 'New') ||
                (formData.modelNumber || '') !== (product.modelNumber || '') ||
                JSON.stringify(formData.tags) !== JSON.stringify(product.tags) ||
                JSON.stringify(formData.features.filter(f => f)) !== JSON.stringify(product.features || []) ||
                JSON.stringify(formData.specifications.filter(s => s.label && s.value)) !== JSON.stringify(product.specifications || []) ||
                JSON.stringify(formData.warranty) !== JSON.stringify(product.warranty) ||
                images.length > 0 ||
                deletedImages.length > 0;

            if (!hasDataChanged) {
                return onCancel();
            }
        }

        if (!validateForm()) return;

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (['specifications', 'features', 'tags', 'warranty'].includes(key)) {
                const filtered = key === 'specifications' 
                    ? formData[key].filter(s => s.label && s.value)
                    : key === 'features' ? formData[key].filter(f => f) : formData[key];
                data.append(key, JSON.stringify(filtered));
            } else if (key === 'stock') {
                data.append(key, Number(formData[key]) || 0);
            } else if (key === 'price') {
                data.append(key, Number(formData[key]));
            } else {
                data.append(key, formData[key]);
            }
        });

        if (isEdit) {
            data.append('deletedImages', JSON.stringify(deletedImages));
        }
        
        images.forEach(img => data.append('images', img));

        const success = isEdit 
            ? await updateProduct(product._id, data)
            : await addProduct(data);

        if (success && onComplete) onComplete();
    };


    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={24}/></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {isEdit ? "Update Listing" : "Create Listing"}
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                            {isEdit ? `Editing: ${product.name}` : "Step-by-step listing builder"}
                        </p>
                    </div>
                </div>
                
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Package size={24} /></div>
                            <h2 className="text-xl font-bold uppercase tracking-wider">General Information</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Marketplace Title</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.name ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium`} placeholder="e.g. Sony WH-1000XM5" />
                                    {errors.name && <ErrorMsg message={errors.name} />}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
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
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Inventory Stock</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.stock ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold`} placeholder="1" min="1" />
                                    {errors.stock && <ErrorMsg message={errors.stock} />}
                                </div>
                            </div>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="6" className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.description ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium resize-none`} placeholder="Detailed description..." />
                        </div>
                    </section>

                    {/* Features */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><ListChecks size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider">Features</h2></div>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, features: [...p.features, ''] }))} className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20}/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.features.map((f, i) => (
                                <div key={i} className="flex gap-2 group">
                                    <input value={f} onChange={(e) => { const n = [...formData.features]; n[i] = e.target.value; setFormData(p => ({ ...p, features: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="Feature..." />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tech Specs */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Activity size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider">Specifications</h2></div>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, specifications: [...p.specifications, { label: '', value: '' }] }))} className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20}/></button>
                        </div>
                        <div className="space-y-3">
                            {formData.specifications.map((spec, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                    <input placeholder="Key" value={spec.label} onChange={(e) => { const n = [...formData.specifications]; n[i].label = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-bold uppercase dark:text-white" />
                                    <input placeholder="Value" value={spec.value} onChange={(e) => { const n = [...formData.specifications]; n[i].value = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-medium dark:text-white" />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, specifications: p.specifications.filter((_, idx) => idx !== i) }))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Gallery */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Upload size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider">Product Gallery</h2></div>
                            <span className="text-xs font-bold text-gray-400">{existingImages.length + images.length}/5</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <AnimatePresence>
                                {existingImages.map((url) => (
                                    <motion.div key={url} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-emerald-500/30 group">
                                        <img src={`${IMG_BASE_URL}${url}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                        <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-500 text-white text-[7px] font-bold uppercase rounded-lg">Live</div>
                                    </motion.div>
                                ))}
                                {images.map((img, i) => (
                                    <motion.div key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-blue-500/30 group">
                                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button type="button" onClick={() => removeNewImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                                        <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-blue-500 text-white text-[7px] font-bold uppercase rounded-lg">New</div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {existingImages.length + images.length < 5 && (
                                <button type="button" onClick={() => fileInputRef.current.click()} className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-700 bg-gray-50/30 flex flex-col items-center justify-center gap-1 text-gray-300 hover:text-blue-500 hover:border-blue-500 transition-all cursor-pointer">
                                    <Plus size={32} strokeWidth={1} /><span className="text-[10px] font-bold uppercase tracking-tighter">Media</span>
                                </button>
                            )}
                        </div>
                        <input type="file" hidden multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                        {errors.images && <ErrorMsg message={errors.images} />}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><TagIcon size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider">Context</h2></div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Brand</label>
                                <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none dark:text-white" placeholder="Optional" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Condition</label>
                                    <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-3 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold dark:text-white">
                                        <option value="New">New</option><option value="Refurbished">Refurbished</option><option value="Used">Used</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Model</label>
                                    <input type="text" name="modelNumber" value={formData.modelNumber} onChange={handleInputChange} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-medium dark:text-white" placeholder="N/A" />
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><TagIcon size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider">SEO Tags</h2></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.tags.length}/5</span>
                        </div>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={addTag}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold dark:text-white"
                                placeholder="Press Enter to add tag"
                            />
                            {errors.tags && <ErrorMsg message={errors.tags} />}
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 rounded-xl uppercase tracking-wider">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)}><X size={10}/></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Shield size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider">Warranty</h2></div>
                            <button type="button" onClick={() => handleWarrantyChange('hasWarranty', !formData.warranty.hasWarranty)} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${formData.warranty.hasWarranty ? 'bg-blue-600 justify-end' : 'bg-gray-200 dark:bg-gray-700 justify-start'}`}><motion.div layout className="w-4 h-4 bg-white rounded-full shadow-sm" /></button>
                        </div>
                        <AnimatePresence>
                            {formData.warranty.hasWarranty && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-5 overflow-hidden">
                                    <div className="space-y-4">
                                        <select value={formData.warranty.duration} onChange={(e) => handleWarrantyChange('duration', e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold dark:text-white">
                                            <option value="">Duration</option>
                                            {[1,3,6,12,24,36,48,60].map(m => <option key={m} value={m}>{m} Mo</option>)}
                                        </select>
                                        <select value={formData.warranty.type} onChange={(e) => handleWarrantyChange('type', e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold dark:text-white">
                                            <option value="Manufacturer">Manufacturer</option><option value="Seller">Seller</option>
                                        </select>
                                        
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block px-1">Warranty Rules</label>
                                            <input 
                                                type="text" 
                                                value={warrantyRuleInput}
                                                onChange={(e) => setWarrantyRuleInput(e.target.value)}
                                                onKeyDown={addWarrantyRule}
                                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold dark:text-white"
                                                placeholder="Enter rule and press Enter"
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {formData.warranty.conditions.map((rule, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-xl uppercase tracking-wider border border-gray-100 dark:border-gray-700">
                                                        {rule}
                                                        <button type="button" onClick={() => handleWarrantyChange('conditions', formData.warranty.conditions.filter((_, i) => i !== idx))}><X size={10}/></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    <button type="submit" disabled={loading} className={`w-full py-5 ${isEdit ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'} text-white font-bold rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer group`}>
                        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Settings size={24}/></motion.div> : <>{isEdit ? <Save size={24} /> : <Check size={24} />}<span>{isEdit ? "Update Listing" : "Publish Listing"}</span></>}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ElectronicsForm;
