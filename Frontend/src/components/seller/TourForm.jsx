import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import {
    X, Plus, MapPin, Clock, Users, Calendar,
    Trash2, Save, ArrowLeft, Camera, Tag,
    ChevronDown, ListChecks, Info, Globe, AlertCircle
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

const TourForm = ({ product = null, onCancel, onComplete }) => {
    const { addProduct, updateProduct, loading } = useProductStore();
    const isEdit = !!product;

    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        discountedPrice: product?.discountedPrice || '',
        description: product?.description || '',
        stock: product?.stock || 1,
        category: 'Tour',
        duration: product?.duration || '',
        location: product?.location || '',
        maxGroupSize: product?.maxGroupSize || 1,
        difficulty: product?.difficulty || 'Easy',
        itinerary: product?.itinerary || [{ day: 1, title: '', description: '' }],
        included: product?.included || [],
        excluded: product?.excluded || [],
        languages: product?.languages || ['English'],
        availableDates: product?.availableDates?.map(d => new Date(d).toISOString().split('T')[0]) || [],
        specifications: product?.specifications || [{ label: '', value: '' }],
        tags: product?.tags || [],
    });

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

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => {
            const next = [...prev[field]];
            next[index] = value;
            return { ...prev, [field]: next };
        });
    };

    const addArrayItem = (field, defaultValue = '') => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], defaultValue] }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    };

    const handleItineraryChange = (index, field, value) => {
        setFormData(prev => {
            const next = [...prev.itinerary];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, itinerary: next };
        });
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
            if (formData.tags.length >= 5) return toast.error("Maximum 5 tags allowed");
            if (formData.tags.includes(tagInput.trim())) return setTagInput('');
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const removeTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Tour name is required";
        if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Enter valid price";
        if (formData.discountedPrice && Number(formData.discountedPrice) >= Number(formData.price)) newErrors.discountedPrice = "Must be less than price";
        if (!formData.description || formData.description.length < 10) newErrors.description = "Detailed description needed";
        if (!formData.location) newErrors.location = "Starting location is required";
        if (!formData.duration) newErrors.duration = "Specify duration";
        if (!formData.availableDates || formData.availableDates.filter(d => d).length === 0) {
            newErrors.availableDates = "Select at least one date";
        } else {
            const today = new Date().toISOString().split('T')[0];
            if (formData.availableDates.some(d => d < today)) {
                newErrors.availableDates = "Dates cannot be in the past";
            }
        }
        if (existingImages.length + images.length === 0) newErrors.images = "At least one photo required";
        if (formData.tags.length === 0) newErrors.tags = "At least one SEO tag is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEdit) {
            const hasDataChanged =
                String(formData.name).trim() !== String(product.name).trim() ||
                Number(formData.price) !== Number(product.price) ||
                Number(formData.discountedPrice || 0) !== Number(product.discountedPrice || 0) ||
                String(formData.description).trim() !== String(product.description).trim() ||
                formData.duration !== product.duration ||
                formData.location !== product.location ||
                Number(formData.maxGroupSize) !== Number(product.maxGroupSize) ||
                formData.difficulty !== product.difficulty ||
                JSON.stringify(formData.itinerary) !== JSON.stringify(product.itinerary) ||
                JSON.stringify(formData.included) !== JSON.stringify(product.included) ||
                JSON.stringify(formData.excluded) !== JSON.stringify(product.excluded) ||
                JSON.stringify(formData.languages) !== JSON.stringify(product.languages) ||
                JSON.stringify(formData.availableDates) !== JSON.stringify(product.availableDates?.map(d => new Date(d).toISOString().split('T')[0]) || []) ||
                JSON.stringify(formData.tags) !== JSON.stringify(product.tags) ||
                JSON.stringify(formData.specifications.filter(s => s.label.trim() && s.value.trim())) !== JSON.stringify(product.specifications || []) ||
                images.length > 0 ||
                deletedImages.length > 0;

            if (!hasDataChanged) return onCancel();
        }

        if (!validateForm()) return toast.error("Please fix form errors");

        const data = new FormData();
        const filteredSpecs = formData.specifications.filter(s => s.label.trim() && s.value.trim());
        const submissionData = {
            ...formData,
            specifications: filteredSpecs.length > 0 ? filteredSpecs : null,
            itinerary: formData.itinerary.map((item, index) => ({
                ...item,
                day: index + 1
            }))
        };

        Object.keys(submissionData).forEach(key => {
            if (['itinerary', 'included', 'excluded', 'languages', 'availableDates', 'tags', 'specifications'].includes(key)) {
                data.append(key, JSON.stringify(submissionData[key]));
            } else {
                data.append(key, submissionData[key]);
            }
        });

        images.forEach(img => data.append('images', img));
        if (isEdit) data.append('deletedImages', JSON.stringify(deletedImages));

        const success = isEdit
            ? await updateProduct(product._id, data)
            : await addProduct(data);

        if (success) {
            onComplete();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl shadow-blue-500/5 mb-8">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onCancel} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={24}/></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {isEdit ? "Update Experience" : "List New Experience"}
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                            {isEdit ? `Editing: ${product.name}` : "Experience Listing Builder"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3 mb-2"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Info size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Basic Experience Details</h2></div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Tour Title</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.name ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold text-lg`} placeholder="e.g., Sunset Safari Drive & Bush Dinner" />
                                {errors.name && <ErrorMsg message={errors.name} />}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Price Per Person (UGX)</label>
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
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Starting Point / Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full pl-14 pr-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-none rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium" placeholder="City or specific point" />
                                    </div>
                                    {errors.location && <ErrorMsg message={errors.location} />}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Overview & Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="6" className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.description ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium resize-none`} placeholder="Describe the experience, the vibe, and what makes it special..." />
                                {errors.description && <ErrorMsg message={errors.description} />}
                            </div>
                        </div>
                    </section>

                    {/* Itinerary */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Calendar size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Full Itinerary</h2></div>
                            <button type="button" onClick={() => addArrayItem('itinerary', { day: formData.itinerary.length + 1, title: '', description: '' })} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"><Plus size={20} /></button>
                        </div>

                        <div className="space-y-6">
                            {formData.itinerary.map((item, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 group">
                                    <button type="button" onClick={() => removeArrayItem('itinerary', i)} className="absolute -top-3 -right-3 p-3 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl"><Trash2 size={16} /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div>
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block">Day</label>
                                            <input type="number" value={i + 1} readOnly className="w-full px-5 py-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl outline-none font-bold text-blue-600 cursor-not-allowed" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block">Heading</label>
                                            <input type="text" value={item.title} onChange={(e) => handleItineraryChange(i, 'title', e.target.value)} className="w-full px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl outline-none font-bold text-sm dark:text-white" placeholder="e.g. Arrival & Welcome Dinner" />
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 block">What will happen?</label>
                                            <textarea value={item.description} onChange={(e) => handleItineraryChange(i, 'description', e.target.value)} rows="3" className="w-full px-5 py-4 bg-white dark:bg-gray-800 rounded-2xl outline-none font-medium text-sm resize-none dark:text-white" placeholder="Details of the day's activities..." />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        {errors.itinerary && <ErrorMsg message={errors.itinerary} />}
                    </section>

                    {/* Included / Excluded */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3"><div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><ListChecks size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider dark:text-white">Included</h2></div>
                                <button type="button" onClick={() => addArrayItem('included')} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Plus size={16} /></button>
                            </div>
                            <div className="space-y-3">
                                {formData.included.map((item, i) => (
                                    <div key={i} className="flex gap-2 group">
                                        <input value={item} onChange={(e) => handleArrayChange('included', i, e.target.value)} className="flex-1 px-5 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. Hotel Pickup" />
                                        <button type="button" onClick={() => removeArrayItem('included', i)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3"><div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600"><X size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider dark:text-white">Excluded</h2></div>
                                <button type="button" onClick={() => addArrayItem('excluded')} className="p-2 bg-red-50 text-red-600 rounded-xl"><Plus size={16} /></button>
                            </div>
                            <div className="space-y-3">
                                {formData.excluded.map((item, i) => (
                                    <div key={i} className="flex gap-2 group">
                                        <input value={item} onChange={(e) => handleArrayChange('excluded', i, e.target.value)} className="flex-1 px-5 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none text-xs font-bold dark:text-white" placeholder="e.g. Personal Travel Insurance" />
                                        <button type="button" onClick={() => removeArrayItem('excluded', i)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Policies & Requirements */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Info size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Policies & Requirements</h2></div>
                            <button type="button" onClick={() => addArrayItem('specifications', { label: '', value: '' })} className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            {formData.specifications.map((spec, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                    <input placeholder="Requirement (e.g. Min Age)" value={spec.label} onChange={(e) => { const n = [...formData.specifications]; n[i].label = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-bold uppercase dark:text-white" />
                                    <input placeholder="Details (e.g. 18+)" value={spec.value} onChange={(e) => { const n = [...formData.specifications]; n[i].value = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-medium dark:text-white" />
                                    <button type="button" onClick={() => removeArrayItem('specifications', i)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Gallery */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Camera size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider dark:text-white">Photo Gallery</h2></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {existingImages.map((url, i) => (
                                <div key={i} className="relative h-48 rounded-[2rem] overflow-hidden group shadow-lg">
                                    <img src={`${IMG_BASE_URL}${url.url || url}`} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-xl text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            {images.map((file, i) => (
                                <div key={i} className="relative h-48 rounded-[2rem] overflow-hidden group shadow-lg">
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-xl text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
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
                    {/* Key Tour Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Clock size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider dark:text-white">Quick Stats</h2></div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Total Duration</label>
                                <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold outline-none dark:text-white" placeholder="e.g., 3 Days / 2 Nights" />
                                {errors.duration && <ErrorMsg message={errors.duration} />}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1"><Users size={10} /> Group Size</label>
                                    <input type="number" name="maxGroupSize" value={formData.maxGroupSize} onChange={handleInputChange} min="1" className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-medium outline-none dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Difficulty</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="w-full px-3 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-[10px] font-bold outline-none dark:text-white">
                                        <option value="Easy">Easy</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Challenging">Challenging</option>
                                        <option value="Extreme">Extreme</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1"><Calendar size={10} /> Available Dates</label>
                                
                                {/* Bulk Date Generator */}
                                <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 mb-4">
                                  <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Quick Add Dates</p>
                                  
                                  {/* Month + Year Selector */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Month</label>
                                      <select 
                                        id="bulkMonth" 
                                        defaultValue={new Date().getMonth()} 
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-xl text-xs font-bold outline-none dark:text-white border border-gray-100 dark:border-gray-700"
                                      >
                                        {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                                          <option key={i} value={i}>{m}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Year</label>
                                      <select 
                                        id="bulkYear" 
                                        defaultValue={new Date().getFullYear()} 
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-xl text-xs font-bold outline-none dark:text-white border border-gray-100 dark:border-gray-700"
                                      >
                                        {[0,1,2].map(offset => {
                                          const y = new Date().getFullYear() + offset;
                                          return <option key={y} value={y}>{y}</option>;
                                        })}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Weekday Toggles */}
                                  <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Days of Week</label>
                                    <div className="flex flex-wrap gap-2" id="weekdayToggles">
                                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => (
                                        <label key={day} className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:border-blue-300 transition-colors">
                                          <input type="checkbox" value={i} className="accent-blue-600" defaultChecked={i > 0 && i < 6} />
                                          <span className="text-[10px] font-bold dark:text-white">{day}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      const monthEl = document.getElementById('bulkMonth');
                                      const yearEl = document.getElementById('bulkYear');
                                      const month = parseInt(monthEl.value);
                                      const year = parseInt(yearEl.value);
                                      const checkboxes = document.querySelectorAll('#weekdayToggles input[type=checkbox]:checked');
                                      const selectedDays = Array.from(checkboxes).map(cb => parseInt(cb.value));
                                      
                                      if (selectedDays.length === 0) {
                                        toast.error("Select at least one day of the week");
                                        return;
                                      }
                                      
                                      const today = new Date().toISOString().split('T')[0];
                                      const newDates = [];
                                      const daysInMonth = new Date(year, month + 1, 0).getDate();
                                      
                                      for (let d = 1; d <= daysInMonth; d++) {
                                        const date = new Date(year, month, d);
                                        const dateStr = date.toISOString().split('T')[0];
                                        if (dateStr >= today && selectedDays.includes(date.getDay())) {
                                          newDates.push(dateStr);
                                        }
                                      }
                                      
                                      if (newDates.length === 0) {
                                        toast.error("No valid future dates found for selected criteria");
                                        return;
                                      }
                                      
                                      setFormData(prev => ({
                                        ...prev,
                                        availableDates: [...new Set([...prev.availableDates, ...newDates])].sort()
                                      }));
                                      toast.success(`Added ${newDates.length} dates for ${['January','February','March','April','May','June','July','August','September','October','November','December'][month]} ${year}`);
                                    }}
                                    className="w-full py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                  >
                                    <Plus size={14} /> Generate Dates for Month
                                  </button>

                                  {/* Date Range Quick Add */}
                                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2">Or Add Date Range</p>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                      <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">From</label>
                                        <input type="date" id="rangeFrom" min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-3 bg-white dark:bg-gray-800 rounded-xl text-xs font-bold outline-none dark:text-white border border-gray-100 dark:border-gray-700" />
                                      </div>
                                      <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">To</label>
                                        <input type="date" id="rangeTo" min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-3 bg-white dark:bg-gray-800 rounded-xl text-xs font-bold outline-none dark:text-white border border-gray-100 dark:border-gray-700" />
                                      </div>
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const from = document.getElementById('rangeFrom').value;
                                        const to = document.getElementById('rangeTo').value;
                                        if (!from || !to || from > to) {
                                          toast.error("Please select a valid date range");
                                          return;
                                        }
                                        const newDates = [];
                                        const current = new Date(from);
                                        const end = new Date(to);
                                        while (current <= end) {
                                          newDates.push(current.toISOString().split('T')[0]);
                                          current.setDate(current.getDate() + 1);
                                        }
                                        setFormData(prev => ({
                                          ...prev,
                                          availableDates: [...new Set([...prev.availableDates, ...newDates])].sort()
                                        }));
                                        toast.success(`Added ${newDates.length} dates`);
                                      }}
                                      className="w-full py-2.5 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                      <Plus size={14} /> Add Range
                                    </button>
                                  </div>
                                </div>

                                {/* Manual fallback + Date Preview */}
                                <div className="space-y-3">
                                    {formData.availableDates.length > 0 && (
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{formData.availableDates.length} dates selected</p>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, availableDates: [] }))} className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline">Clear All</button>
                                      </div>
                                    )}
                                    <div className="max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar">
                                      {formData.availableDates.map((date, i) => (
                                        <div key={i} className="flex gap-2 group items-center px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                            <Calendar size={12} className="text-blue-500 flex-shrink-0" />
                                            <span className="flex-1 text-[10px] font-bold dark:text-white">
                                              {new Date(date + 'T00:00:00').toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <button type="button" onClick={() => removeArrayItem('availableDates', i)} className="p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                        </div>
                                      ))}
                                    </div>
                                    <button type="button" onClick={() => addArrayItem('availableDates')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">+ Add Single Date</button>
                                    {/* Keep manual inputs for any empty entries */}
                                    {formData.availableDates.map((date, i) => (
                                      !date && (
                                        <div key={`manual-${i}`} className="flex gap-2 group">
                                          <input
                                            type="date"
                                            value={date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => handleArrayChange('availableDates', i, e.target.value)}
                                            className={`flex-1 px-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 ${errors.availableDates ? 'border-red-500/30' : 'border-transparent'} rounded-2xl text-xs font-medium outline-none dark:text-white`}
                                          />
                                          <button type="button" onClick={() => removeArrayItem('availableDates', i)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                        </div>
                                      )
                                    ))}
                                </div>
                                {errors.availableDates && <ErrorMsg message={errors.availableDates} />}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1"><Globe size={10} /> Tour Languages</label>
                                <div className="space-y-3">
                                    {formData.languages.map((lang, i) => (
                                        <div key={i} className="flex gap-2 group">
                                            <input value={lang} onChange={(e) => handleArrayChange('languages', i, e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl outline-none text-[10px] font-bold" />
                                            <button type="button" onClick={() => removeArrayItem('languages', i)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addArrayItem('languages')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">+ Add Language</button>
                                </div>
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
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isEdit ? <Save size={24} /> : <Plus size={24} />}<span>{isEdit ? "Update Experience" : "Publish Experience"}</span></>}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default TourForm;
