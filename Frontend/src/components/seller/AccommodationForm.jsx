import React, { useState, useRef } from 'react';
import {
    Plus,
    Upload,
    X,
    Check,
    Home,
    Tag as TagIcon,
    Settings,
    ListChecks,
    Activity,
    ArrowLeft,
    Save,
    MapPin,
    Clock,
    AlertTriangle,
    Users,
    Calendar
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

const AccommodationForm = ({ product = null, onCancel, onComplete }) => {
    const { addProduct, updateProduct, loading } = useProductStore();
    const isEdit = !!product;

    const [images, setImages] = useState([]); // New images
    const [existingImages, setExistingImages] = useState(product?.images || []);
    const [deletedImages, setDeletedImages] = useState([]);

    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');

    const [formData, setFormData] = useState({
        name: product?.name || '',
        price: product?.price || '',
        discountedPrice: product?.discountedPrice || '',
        description: product?.description || '',
        stock: 1, // Quantity always defaults to 1 for all accommodations
        category: 'Accommodation', // Fixed category
        propertyType: product?.propertyType || 'Room',
        roomType: product?.roomType || 'Single',
        address: product?.address || '',
        maxOccupancy: product?.maxOccupancy || 1,
        numberOfRooms: product?.numberOfRooms || 1,
        mapsLink: product?.mapsLink || '',
        checkInTime: product?.checkInTime || '14:00',
        checkOutTime: product?.checkOutTime || '11:00',
        specifications: product?.specifications || [{ label: '', value: '' }],
        features: product?.features || [''],
        tags: product?.tags || [],
        availableDates: product?.availableDates?.map(d => new Date(d).toISOString().split('T')[0]) || []
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value, stock: 1 };
            // If property type is not Room, set roomType to 'Entire Place'
            if (name === 'propertyType') {
                if (value !== 'Room') {
                    newState.roomType = 'Entire Place';
                } else {
                    // Reset to 1 if it's a room
                    newState.numberOfRooms = 1;
                }
            }
            return newState;
        });
        if (errors[name]) setErrors(prev => { const up = { ...prev }; delete up[name]; return up; });
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

    const addDateRange = () => {
        if (!rangeStart || !rangeEnd) return toast.error("Select both start and end dates");
        if (rangeEnd < rangeStart) return toast.error("End date cannot be before start date");

        const dates = [];
        let curr = new Date(rangeStart);
        const end = new Date(rangeEnd);

        while (curr <= end) {
            dates.push(curr.toISOString().split('T')[0]);
            curr.setDate(curr.getDate() + 1);
        }

        setFormData(prev => {
            const existing = new Set(prev.availableDates);
            const combined = [...prev.availableDates];
            dates.forEach(d => {
                if (!existing.has(d)) {
                    combined.push(d);
                    existing.add(d);
                }
            });
            // Sort dates for better UX
            return { ...prev, availableDates: combined.sort() };
        });
        
        setRangeStart('');
        setRangeEnd('');
        toast.success(`Added ${dates.length} dates`);
    };

    const excludeDateRange = () => {
        if (!rangeStart || !rangeEnd) return toast.error("Select both start and end dates to exclude");
        if (rangeEnd < rangeStart) return toast.error("End date cannot be before start date");

        const start = new Date(rangeStart).toISOString().split('T')[0];
        const end = new Date(rangeEnd).toISOString().split('T')[0];

        setFormData(prev => {
            const filtered = prev.availableDates.filter(d => d < start || d > end);
            const removedCount = prev.availableDates.length - filtered.length;
            if (removedCount > 0) toast.success(`Excluded ${removedCount} dates`);
            else toast.info("No dates found in this range to exclude");
            return { ...prev, availableDates: filtered };
        });

        setRangeStart('');
        setRangeEnd('');
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
        if (!formData.address || formData.address.length < 5) newErrors.address = "Valid address required";
        if (formData.mapsLink && !formData.mapsLink.startsWith('http')) newErrors.mapsLink = "Enter a valid URL (starting with http/https)";
        if (existingImages.length + images.length === 0) newErrors.images = "At least one photo required";
        if (formData.tags.length === 0) newErrors.tags = "At least one SEO tag is required";
        if (!formData.numberOfRooms || Number(formData.numberOfRooms) < 1) newErrors.numberOfRooms = "Must have at least 1 room";
        
        if (!formData.availableDates || formData.availableDates.filter(d => d).length === 0) {
            newErrors.availableDates = "Select at least one available date";
        } else {
            const today = new Date().toISOString().split('T')[0];
            if (formData.availableDates.some(d => d < today)) {
                newErrors.availableDates = "Dates cannot be in the past";
            }
        }
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Please fix the highlighted errors");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEdit) {
            const hasDataChanged =
                String(formData.name).trim() !== String(product.name).trim() ||
                Number(formData.price) !== Number(product.price) ||
                Number(formData.discountedPrice || 0) !== Number(product.discountedPrice || 0) ||
                String(formData.description).trim() !== String(product.description).trim() ||
                Number(formData.stock) !== Number(product.stock) ||
                formData.propertyType !== product.propertyType ||
                formData.roomType !== product.roomType ||
                formData.numberOfRooms !== product.numberOfRooms ||
                formData.mapsLink !== (product.mapsLink || '') ||
                String(formData.address).trim() !== String(product.address).trim() ||
                Number(formData.maxOccupancy) !== Number(product.maxOccupancy) ||
                formData.checkInTime !== product.checkInTime ||
                formData.checkOutTime !== product.checkOutTime ||
                JSON.stringify(formData.tags) !== JSON.stringify(product.tags) ||
                JSON.stringify(formData.features.filter(f => f)) !== JSON.stringify(product.features || []) ||
                JSON.stringify(formData.specifications.filter(s => s.label.trim() && s.value.trim())) !== JSON.stringify(product.specifications || []) ||
                JSON.stringify(formData.availableDates) !== JSON.stringify(product.availableDates?.map(d => new Date(d).toISOString().split('T')[0]) || []) ||
                images.length > 0 ||
                deletedImages.length > 0;

            if (!hasDataChanged) {
                return onCancel();
            }
        }

        if (!validateForm()) return;

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (['specifications', 'features', 'tags', 'availableDates'].includes(key)) {
                const filtered = key === 'specifications'
                    ? formData[key].filter(s => s.label.trim() && s.value.trim())
                    : key === 'features' ? formData[key].filter(f => f) : formData[key];
                data.append(key, JSON.stringify(filtered));
            } else if (['stock', 'price', 'maxOccupancy', 'numberOfRooms'].includes(key)) {
                data.append(key, Number(formData[key]) || 0);
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
                    <button type="button" onClick={onCancel} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><ArrowLeft size={24} /></button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {isEdit ? "Update Property" : "Add Property"}
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                            {isEdit ? `Editing: ${product.name}` : "Step-by-step property builder"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Home size={24} /></div>
                            <h2 className="text-xl font-bold uppercase tracking-wider">Property Information</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Property Name / Title</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.name ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium`} placeholder="e.g. Serena Hotel, Kampala" />
                                    {errors.name && <ErrorMsg message={errors.name} />}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-2"><MapPin size={12} /> Complete Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.address ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium`} placeholder="Street, City, District" />
                                    {errors.address && <ErrorMsg message={errors.address} />}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-2"><MapPin size={12} /> Google Maps Link (Optional)</label>
                                    <input type="url" name="mapsLink" value={formData.mapsLink} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.mapsLink ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium`} placeholder="https://maps.google.com/..." />
                                    {errors.mapsLink && <ErrorMsg message={errors.mapsLink} />}
                                </div>
                                <div className="md:col-span-2 grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Price Per Night (UGX)</label>
                                        <input type="number" name="price" value={formData.price} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.price ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold`} placeholder="0" />
                                        {errors.price && <ErrorMsg message={errors.price} />}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Discount Price</label>
                                        <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleInputChange} className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.discountedPrice ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-bold`} placeholder="Optional" />
                                        {errors.discountedPrice && <ErrorMsg message={errors.discountedPrice} />}
                                    </div>
                                </div>
                            </div>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="6" className={`w-full px-7 py-4.5 bg-gray-50 dark:bg-gray-900/50 border-2 ${errors.description ? 'border-red-500/30' : 'border-transparent'} rounded-[1.5rem] outline-none focus:ring-4 ring-blue-500/10 dark:text-white font-medium resize-none`} placeholder="Describe the property, view, location perks..." />
                        </div>
                    </section>

                    {/* Highlights & Amenities */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><ListChecks size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider">Highlights & Amenities</h2></div>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, features: [...p.features, ''] }))} className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {formData.features.map((f, i) => (
                                <div key={i} className="flex gap-2 group">
                                    <input value={f} onChange={(e) => { const n = [...formData.features]; n[i] = e.target.value; setFormData(p => ({ ...p, features: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-xs font-bold dark:text-white" placeholder="E.g., Wi-Fi, Pool, Ocean view..." />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, features: p.features.filter((_, idx) => idx !== i) }))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Rules & Policies */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Activity size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider">Rules & Policies</h2></div>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, specifications: [...p.specifications, { label: '', value: '' }] }))} className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Plus size={20} /></button>
                        </div>
                        <div className="space-y-3">
                            {formData.specifications.map((spec, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                    <input placeholder="Rule (e.g. Pets)" value={spec.label} onChange={(e) => { const n = [...formData.specifications]; n[i].label = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-bold uppercase dark:text-white" />
                                    <input placeholder="Policy (e.g. Not allowed)" value={spec.value} onChange={(e) => { const n = [...formData.specifications]; n[i].value = e.target.value; setFormData(p => ({ ...p, specifications: n })); }} className="flex-1 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl outline-none text-[10px] font-medium dark:text-white" />
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, specifications: p.specifications.filter((_, idx) => idx !== i) }))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={18} /></button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Gallery */}
                    <section className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Upload size={24} /></div><h2 className="text-xl font-bold uppercase tracking-wider">Property Gallery</h2></div>
                            <span className="text-xs font-bold text-gray-400">{existingImages.length + images.length}/5</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                            <AnimatePresence>
                                {existingImages.map((url) => (
                                    <motion.div key={url} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-emerald-500/30 group">
                                        <img src={`${IMG_BASE_URL}${url}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                        <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-emerald-500 text-white text-[7px] font-bold uppercase rounded-lg">Live</div>
                                    </motion.div>
                                ))}
                                {images.map((img, i) => (
                                    <motion.div key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-blue-500/30 group">
                                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <button type="button" onClick={() => removeNewImage(i)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
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
                        <div className="flex items-center gap-3"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><TagIcon size={20} /></div><h2 className="text-lg font-bold uppercase tracking-wider">Categorization</h2></div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Property Type</label>
                                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-bold outline-none dark:text-white">
                                    <option value="Room">Room</option>
                                    <option value="Resort">Resort</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Guesthouse">Guesthouse</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {formData.propertyType === 'Room' ? (
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1">Room Type</label>
                                        <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="w-full px-3 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-[10px] font-bold outline-none dark:text-white">
                                            <option value="Single">Single</option>
                                            <option value="Double">Double</option>
                                            <option value="Suite">Suite</option>
                                            <option value="Studio">Studio</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1">Available Rooms</label>
                                        <input type="number" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleInputChange} min="1" className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-medium outline-none dark:text-white" placeholder="1" />
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1"><Users size={10} /> Max Occupancy</label>
                                    <input type="number" name="maxOccupancy" value={formData.maxOccupancy} onChange={handleInputChange} min="1" className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-xs font-medium outline-none dark:text-white" placeholder="1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1"><Clock size={10} /> Check-in</label>
                                    <input type="time" name="checkInTime" value={formData.checkInTime} onChange={handleInputChange} className="w-full px-3 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-[10px] font-bold outline-none dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1"><Clock size={10} /> Check-out</label>
                                    <input type="time" name="checkOutTime" value={formData.checkOutTime} onChange={handleInputChange} className="w-full px-3 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-[10px] font-bold outline-none dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block px-1 flex items-center gap-1"><Calendar size={10} /> Add Available Dates</label>
                                
                                {/* Range Selector */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl mb-4 space-y-3">
                                    <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Quick Add Range</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="date" 
                                            value={rangeStart} 
                                            onChange={(e) => setRangeStart(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border-none rounded-xl text-[10px] font-bold outline-none dark:text-white" 
                                        />
                                        <input 
                                            type="date" 
                                            value={rangeEnd} 
                                            onChange={(e) => setRangeEnd(e.target.value)}
                                            min={rangeStart || new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border-none rounded-xl text-[10px] font-bold outline-none dark:text-white" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            type="button" 
                                            onClick={addDateRange}
                                            className="py-2 bg-blue-600 text-white text-[9px] font-bold uppercase rounded-xl hover:bg-blue-700 transition-colors"
                                        >
                                            Add Range
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={excludeDateRange}
                                            className="py-2 bg-red-500 text-white text-[9px] font-bold uppercase rounded-xl hover:bg-red-600 transition-colors"
                                        >
                                            Exclude Range
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Individual Dates ({formData.availableDates.length})</p>
                                    <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                        {formData.availableDates.map((date, i) => (
                                            <div key={i} className="flex gap-2 group">
                                                <input
                                                    type="date"
                                                    value={date}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => handleArrayChange('availableDates', i, e.target.value)}
                                                    className={`flex-1 px-4 py-4 bg-gray-50 dark:bg-gray-900 border-2 ${errors.availableDates ? 'border-red-500/30' : 'border-transparent'} rounded-2xl text-[10px] font-bold outline-none dark:text-white`}
                                                />
                                                <button type="button" onClick={() => removeArrayItem('availableDates', i)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addArrayItem('availableDates')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">+ Add Single Date</button>
                                </div>
                                {errors.availableDates && <ErrorMsg message={errors.availableDates} />}
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
                                        <button type="button" onClick={() => removeTag(tag)}><X size={10} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    <button type="submit" disabled={loading} className={`w-full py-5 ${isEdit ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 shadow-blue-500/20'} text-white font-bold rounded-[2.5rem] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 cursor-pointer group`}>
                        {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Settings size={24} /></motion.div> : <>{isEdit ? <Save size={24} /> : <Check size={24} />}<span>{isEdit ? "Update Property" : "Publish Property"}</span></>}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AccommodationForm;
