import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { 
    X, Plus, Tag, Scale, Calendar, Info, 
    ArrowLeft, Save, Camera, AlertCircle, ShoppingBasket,
    Flame, Droplet, Zap, HeartPulse
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

const GroceryForm = ({ product = null, onCancel, onComplete }) => {
    const { addProduct, updateProduct, loading } = useProductStore();
    const isEdit = !!product;

    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        discountedPrice: product?.discountedPrice || '',
        description: product?.description || '',
        stock: product?.stock || 1,
        category: 'Grocery',
        brand: product?.brand || '',
        weight: product?.weight || '',
        unit: product?.unit || 'pcs',
        expiryDate: product?.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
        storageInstructions: product?.storageInstructions || '',
        dietaryInfo: product?.dietaryInfo || [],
        nutritionalInfo: product?.nutritionalInfo || {
            calories: '',
            fat: '',
            protein: '',
            carbs: ''
        },
        specifications: product?.specifications || [{ label: '', value: '' }],
        tags: product?.tags || []
    });

    const [hasExpiryDate, setHasExpiryDate] = useState(!!product?.expiryDate);

    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [deletedImages, setDeletedImages] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [dietaryInput, setDietaryInput] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors(prev => { const up = { ...prev }; delete up[name]; return up; });
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

    const addArrayItem = (field, value, setInput) => {
        if (!value.trim()) return;
        if (formData[field].includes(value.trim())) return setInput('');
        if (field === 'tags' && formData.tags.length >= 5) return toast.error("Max 5 tags");
        setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
        setInput('');
    };

    const removeArrayItem = (field, item) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter(i => i !== item) }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Product name is required";
        if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Enter valid price";
        if (formData.discountedPrice && Number(formData.discountedPrice) >= Number(formData.price)) newErrors.discountedPrice = "Must be less than price";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.stock || Number(formData.stock) < 1) newErrors.stock = "Stock must be at least 1";
        if (formData.weight && !formData.unit) newErrors.unit = "Please select a unit for the weight";
        if (hasExpiryDate && formData.expiryDate && new Date(formData.expiryDate) < new Date().setHours(0,0,0,0)) {
            newErrors.expiryDate = "Expiry date cannot be in the past";
        }
        if (formData.tags.length === 0) newErrors.tags = "At least one SEO tag is required";
        if (existingImages.length + images.length === 0) newErrors.images = "At least one photo required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return toast.error("Please fix form errors");

        const submissionData = { ...formData };
        if (!hasExpiryDate) {
            submissionData.expiryDate = '';
        }

        // Make specifications optional by filtering out blank entries
        const filteredSpecs = formData.specifications.filter(s => s.label.trim() && s.value.trim());
        submissionData.specifications = filteredSpecs.length > 0 ? filteredSpecs : null;

        const data = new FormData();
        Object.keys(submissionData).forEach(key => {
            if (['dietaryInfo', 'nutritionalInfo', 'tags', 'specifications'].includes(key)) {
                if (submissionData[key] !== null) {
                    data.append(key, JSON.stringify(submissionData[key]));
                }
            } else {
                data.append(key, submissionData[key]);
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
                            {isEdit ? "Update Grocery Item" : "Add New Grocery"}
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                            {isEdit ? `Editing: ${product.name}` : "Grocery & Essentials Builder"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 mb-2"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><ShoppingBasket size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Product Basics</h2></div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Product Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.name ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold text-lg`} placeholder="e.g., Premium Basmati Rice" />
                                {errors.name && <ErrorMsg message={errors.name} />}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Brand (Optional)</label>
                                    <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium" placeholder="Manufacturer name" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Initial Stock</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.stock ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold`} placeholder="1" min="1" />
                                    {errors.stock && <ErrorMsg message={errors.stock} />}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Description & Storage</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.description ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium resize-none`} placeholder="Product details and storage instructions..." />
                                {errors.description && <ErrorMsg message={errors.description} />}
                            </div>
                        </div>
                    </section>

                    {/* Weight & Expiry */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 mb-2"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Scale size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Measurement & Expiry</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Weight / Volume</label>
                                <input 
                                    type="number" 
                                    name="weight" 
                                    value={formData.weight} 
                                    onChange={handleInputChange} 
                                    className="w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold" 
                                    placeholder="0.0"
                                    step="0.1"
                                    min="0"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Unit</label>
                                <select name="unit" value={formData.unit} onChange={handleInputChange} className={`w-full px-4 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 ${errors.unit ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold text-xs uppercase`}>
                                    <option value="">Select Unit</option>
                                    <option value="pcs">Pieces</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="g">Grams</option>
                                    <option value="l">Litres</option>
                                    <option value="ml">Millilitres</option>
                                    <option value="pack">Pack</option>
                                    <option value="bottle">Bottle</option>
                                </select>
                                {errors.unit && <ErrorMsg message={errors.unit} />}
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Expiry Date</label>
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <input 
                                        type="checkbox" 
                                        id="hasExpiry" 
                                        checked={hasExpiryDate} 
                                        onChange={(e) => {
                                            setHasExpiryDate(e.target.checked);
                                            if (!e.target.checked) {
                                                setFormData(p => ({ ...p, expiryDate: '' }));
                                                if (errors.expiryDate) setErrors(prev => { const up = { ...prev }; delete up.expiryDate; return up; });
                                            }
                                        }}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 accent-blue-600 cursor-pointer"
                                    />
                                    <label htmlFor="hasExpiry" className="text-xs font-bold text-gray-600 dark:text-gray-300 cursor-pointer">This item has an expiry date</label>
                                </div>
                                {hasExpiryDate && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                        <input type="date" name="expiryDate" value={formData.expiryDate} min={new Date().toISOString().split('T')[0]} onChange={handleInputChange} className={`w-full px-4 py-4.5 bg-gray-50 dark:bg-gray-900 border-2 ${errors.expiryDate ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold text-xs`} />
                                        {errors.expiryDate && <ErrorMsg message={errors.expiryDate} />}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Nutritional Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 mb-2"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Flame size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Nutritional Facts</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1.5"><Zap size={10} /> Calories</label>
                                <input type="text" name="nutritionalInfo.calories" value={formData.nutritionalInfo.calories} onChange={handleInputChange} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. 250" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1.5"><Droplet size={10} /> Fat</label>
                                <input type="text" name="nutritionalInfo.fat" value={formData.nutritionalInfo.fat} onChange={handleInputChange} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. 10g" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1.5"><Zap size={10} /> Protein</label>
                                <input type="text" name="nutritionalInfo.protein" value={formData.nutritionalInfo.protein} onChange={handleInputChange} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. 5g" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1.5"><HeartPulse size={10} /> Carbs</label>
                                <input type="text" name="nutritionalInfo.carbs" value={formData.nutritionalInfo.carbs} onChange={handleInputChange} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. 30g" />
                            </div>
                        </div>
                    </section>

                    {/* Product Specifications */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Info size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Product Specifications</h2></div>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, specifications: [...p.specifications, { label: '', value: '' }] }))} className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            {formData.specifications.map((spec, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                    <input placeholder="Attribute (e.g. Origin)" value={spec.label} onChange={(e) => { const n = [...formData.specifications]; n[i].label = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-bold uppercase dark:text-white" />
                                    <input placeholder="Value (e.g. Uganda)" value={spec.value} onChange={(e) => { const n = [...formData.specifications]; n[i].value = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-medium dark:text-white" />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, specifications: p.specifications.filter((_, idx) => idx !== i) }))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                                </div>
                            ))}
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
                    {/* Dietary Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Info size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider dark:text-white">Dietary Info</h2></div>
                        <div className="space-y-4">
                            <input type="text" value={dietaryInput} onChange={(e) => setDietaryInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('dietaryInfo', dietaryInput, setDietaryInput))} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. Halal, Organic, Vegan" />
                            <div className="flex flex-wrap gap-2">
                                {formData.dietaryInfo.map(item => (
                                    <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 rounded-xl uppercase tracking-wider">
                                        {item}
                                        <button type="button" onClick={() => removeArrayItem('dietaryInfo', item)}><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Tags */}
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Tag size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider dark:text-white">SEO Tags</h2></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.tags.length}/5</span>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArrayItem('tags', tagInput, setTagInput))} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="Press Enter to add tag" />
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
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isEdit ? <Save size={24} /> : <Plus size={24} />}<span>{isEdit ? "Update Grocery" : "Publish Grocery"}</span></>}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default GroceryForm;
