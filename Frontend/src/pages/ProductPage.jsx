import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "../store/productsStore";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { SkeletonBase } from "../components/Skeleton";
import Footer from "../components/Footer";
import { toast } from "sonner";
import { IMG_BASE_URL, API_BASE_URL } from "../config";

import {
  Star, Heart, ShoppingCart, Truck, ShieldCheck, ArrowLeft,
  MapPin, Clock, Users, Calendar, ChevronDown, ChevronUp,
  Check, Package, Info, Zap, Globe, Mountain, MessageSquare, Send, Search, X
} from "lucide-react";

const IMG_BASE = IMG_BASE_URL;
const REVIEW_API = `${API_BASE_URL}/api/reviews`;


/* ─── Image Gallery ─── */
const ImageGallery = ({ images }) => {
  const [selected, setSelected] = useState(0);
  if (!images?.length) return <div className="aspect-square bg-slate-100 rounded-3xl animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="relative group aspect-[4/5] md:aspect-square">
        <motion.div
          layoutId="main-image"
          className="w-full h-full bg-slate-50/50 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm relative flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={selected}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={`${IMG_BASE}${images[selected]}`}
              alt=""
              className="w-full h-full object-contain p-6 md:p-10 relative z-10"
            />
          </AnimatePresence>
        </motion.div>

        {/* Navigation Dots for Mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden z-10">
          {images.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === selected ? "w-6 bg-rose-500" : "bg-slate-400/50"}`} />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
          {images.map((img, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${i === selected ? "border-rose-500 shadow-md ring-4 ring-rose-50" : "border-slate-100 hover:border-rose-200 bg-slate-50/50"}`}
            >
              <img src={`${IMG_BASE}${img}`} alt="" className="w-full h-full object-contain p-2" loading="lazy" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Rating Stars ─── */
const RatingStars = ({ rating = 0, count = 0 }) => (
  <div className="flex items-center gap-2">
    <div className="flex">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />)}</div>
    <span className="text-sm text-slate-500">{rating.toFixed(1)} ({count} reviews)</span>
  </div>
);

/* ─── Collapsible Section ─── */
const Collapsible = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            {Icon && <Icon className="w-5 h-5 text-rose-500" />}
          </div>
          <span className="font-bold text-slate-900">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-slate-50">
              <div className="pt-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Info Pill ─── */
const InfoPill = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
    <Icon className="w-4 h-4 text-rose-500 flex-shrink-0" />
    <div><p className="text-[10px] text-slate-400 uppercase font-semibold">{label}</p><p className="text-sm font-bold text-slate-800">{value}</p></div>
  </div>
);

/* ─── Date Selector Component ─── */
const DateSelector = ({ availableDates, bookedDates, selectedDates, setSelectedDates, dateSlots, maxGroupSize, isTour }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const normalizedBooked = (bookedDates || []).map(d => new Date(d).toISOString().split('T')[0]);

  // Build a map of date -> available slots for tours
  const slotMap = {};
  if (isTour && dateSlots) {
    dateSlots.forEach(s => {
      const key = new Date(s.date).toISOString().split('T')[0];
      slotMap[key] = s.bookedCount || 0;
    });
  }

  const allDates = (availableDates || [])
    .map(d => new Date(d).toISOString().split('T')[0])
    .filter(d => {
      if (isTour) {
        const booked = slotMap[d] || 0;
        return booked < (maxGroupSize || 1); // Only show dates with slots remaining
      }
      return !normalizedBooked.includes(d);
    })
    .sort();

  const toggleDate = (date) => {
    setSelectedDates(prev => {
      if (isTour) {
        if (prev.includes(date)) return [];
        return [date];
      }
      if (prev.includes(date)) return prev.filter(d => d !== date);
      return [...prev, date].sort();
    });
  };

  const selectRange = (date) => {
    if (isTour) {
      toggleDate(date);
      return;
    }
    if (selectedDates.length === 0) {
      setSelectedDates([date]);
      return;
    }

    const start = selectedDates[0];
    const end = date;

    // If clicking the same date or an earlier date, just reset or toggle
    if (date <= start) {
      toggleDate(date);
      return;
    }

    // Find all available dates between start and end
    const range = allDates.filter(d => d >= start && d <= end);
    setSelectedDates(range);
  };

  const filteredDates = allDates.filter(d => {
    const formatted = new Date(d).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return formatted.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  const groupedDates = filteredDates.reduce((acc, date) => {
    const month = new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(date);
    return acc;
  }, {});

  const currentSelectedLabel = selectedDates.length === 0
    ? "Choose dates"
    : selectedDates.length === 1
      ? new Date(selectedDates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : `${selectedDates.length} dates selected`;

  return (
    <div className="relative">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block px-1">
        Select Date{isTour ? "" : "s"} {selectedDates.length > 0 && <span className="text-rose-500 ml-1">({selectedDates.length})</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-4 bg-white border-2 transition-all rounded-2xl text-sm font-bold ${isOpen ? "border-rose-500 shadow-lg shadow-rose-500/5" : "border-slate-100 hover:border-rose-200"}`}
      >
        <div className="flex items-center gap-3">
          <Calendar className={`w-5 h-5 ${selectedDates.length > 0 ? "text-rose-500" : "text-slate-400"}`} />
          <span className={selectedDates.length > 0 ? "text-slate-900" : "text-slate-400"}>{currentSelectedLabel}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* Search */}
            <div className="p-4 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dates (e.g. 'Monday', 'July')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 ring-rose-500/10"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
              {Object.keys(groupedDates).length > 0 ? (
                Object.entries(groupedDates).map(([month, dates]) => (
                  <div key={month} className="mb-4 last:mb-0">
                    <h4 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{month}</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {dates.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleDate(date)}
                          className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all ${selectedDates.includes(date) ? "bg-rose-50 text-rose-600" : "hover:bg-slate-50 text-slate-700"}`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-bold">{new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long" })}</p>
                            <p className="text-[10px] opacity-60 font-medium">{new Date(date).toLocaleDateString("en-US", { weekday: "long" })}</p>
                            {isTour && (
                              <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${((maxGroupSize || 1) - (slotMap[date] || 0)) <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {(maxGroupSize || 1) - (slotMap[date] || 0)} slots available
                              </p>
                            )}
                          </div>
                          {selectedDates.includes(date) && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <Calendar className="w-10 h-10 text-slate-100 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-bold">No available dates found</p>
                </div>
              )}
            </div>

            {/* Range Select Tip */}
            {selectedDates.length > 0 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                {isTour ? "Only one date can be selected per tour booking" : "Click dates to toggle • Tip: Select multiple for longer stays"}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for closing */}
      {isOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

/* ─── Tour Section ─── */
const TourDetails = ({ product, selectedDates, setSelectedDates, groupSize, setGroupSize }) => {
  const maxGroup = product.maxGroupSize || 1;

  // Calculate min available slots across all selected dates
  const minAvailableSlots = selectedDates.length > 0
    ? Math.min(...selectedDates.map(d => {
        const slot = (product.dateSlots || []).find(
          s => new Date(s.date).toISOString().split('T')[0] === d
        );
        return maxGroup - (slot?.bookedCount || 0);
      }))
    : maxGroup;

  // Calculate tour date span if a date is selected
  const tourSpan = useMemo(() => {
    if (selectedDates.length === 0) return null;
    const startStr = selectedDates[0];
    const durationStr = product.duration || "";
    
    let days = 1;
    const match = durationStr.match(/(\d+)\s*day/i);
    if (match) {
      days = parseInt(match[1], 10);
    } else if (/day/i.test(durationStr)) {
      days = 1;
    }
    
    const startDate = new Date(startStr + 'T00:00:00');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (days - 1));
    
    const formatOptions = { weekday: "short", month: "short", day: "numeric", year: "numeric" };
    return {
      start: startDate.toLocaleDateString("en-US", formatOptions),
      end: endDate.toLocaleDateString("en-US", formatOptions),
      days
    };
  }, [selectedDates, product.duration]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoPill icon={Clock} label="Duration" value={product.duration} />
        <InfoPill icon={MapPin} label="Location" value={product.location} />
        <InfoPill icon={Users} label="Max Group" value={product.maxGroupSize} />
        <InfoPill icon={Mountain} label="Difficulty" value={product.difficulty || "Easy"} />
      </div>

      {product.availableDates?.length > 0 && (
        <DateSelector
          availableDates={product.availableDates}
          bookedDates={product.bookedDates}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          dateSlots={product.dateSlots}
          maxGroupSize={maxGroup}
          isTour={true}
        />
      )}

      {tourSpan && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 mx-1 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tour Schedule</p>
              <p className="text-sm font-bold text-slate-800">
                {tourSpan.start} — {tourSpan.end}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-full shadow-sm flex-shrink-0">
            {tourSpan.days} {tourSpan.days === 1 ? "Day" : "Days"}
          </span>
        </motion.div>
      )}

      {/* Group Size Selector */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">
          Number of People
          {selectedDates.length > 0 && (
            <span className="text-emerald-500 ml-2">({minAvailableSlots} slots available)</span>
          )}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
              className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors font-bold text-lg"
            >−</button>
            <span className="w-14 text-center text-lg font-bold text-slate-900">{groupSize}</span>
            <button
              type="button"
              onClick={() => setGroupSize(Math.min(minAvailableSlots, groupSize + 1))}
              disabled={groupSize >= minAvailableSlots}
              className="w-12 h-12 flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-colors font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed"
            >+</button>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">{groupSize} {groupSize === 1 ? 'person' : 'people'}</p>
            <p className="text-[10px] text-slate-400 font-medium">
              Total: UGX {((product.discountedPrice || product.price) * groupSize * (selectedDates.length || 1)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {product.languages?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500">Languages:</span>
          {product.languages.map((l, i) => <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">{l}</span>)}
        </div>
      )}

      {product.itinerary?.length > 0 && (
        <Collapsible title={`Itinerary (${product.itinerary.length} days)`} icon={Calendar} defaultOpen>
          <div className="space-y-4 mt-3">
            {product.itinerary.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs font-bold">{item.day || i + 1}</div>
                  {i < product.itinerary.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Collapsible>
      )}

      {(product.included?.length > 0 || product.excluded?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {product.included?.length > 0 && (
            <Collapsible title="What's Included" icon={Check} defaultOpen={true}>
              <ul className="space-y-3">{product.included.map((item, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium"><div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-green-600" /></div>{item}</li>)}</ul>
            </Collapsible>
          )}
          {product.excluded?.length > 0 && (
            <Collapsible title="Not Included" icon={Info} defaultOpen={true}>
              <ul className="space-y-3">{product.excluded.map((item, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-500 font-medium"><div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-rose-400 text-[10px] font-bold">✕</span></div>{item}</li>)}</ul>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Accommodation Section ─── */
const AccommodationDetails = ({ product, selectedDates, setSelectedDates }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoPill icon={Package} label="Property" value={product.propertyType} />
        <InfoPill icon={Info} label="Room Type" value={product.roomType} />
        <InfoPill icon={Users} label="Max Guests" value={product.maxOccupancy} />
        <InfoPill icon={Package} label="Rooms" value={product.numberOfRooms} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InfoPill icon={Clock} label="Check-in" value={product.checkInTime || "14:00"} />
        <InfoPill icon={Clock} label="Check-out" value={product.checkOutTime || "11:00"} />
      </div>

      {product.availableDates?.length > 0 ? (
        <DateSelector
          availableDates={product.availableDates}
          bookedDates={product.bookedDates}
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
        />
      ) : (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
          No dates available for this property at the moment.
        </div>
      )}

      {product.address && <InfoPill icon={MapPin} label="Address" value={product.address} />}
      {product.mapsLink && (
        <a
          href={product.mapsLink.startsWith('http') ? product.mapsLink : `https://${product.mapsLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          <MapPin className="w-4 h-4" /> View on Maps
        </a>
      )}
    </div>
  );
};

/* ─── Grocery Section ─── */
const GroceryDetails = ({ product }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {product.weight && <InfoPill icon={Package} label="Weight" value={product.weight} />}
      {product.unit && <InfoPill icon={Info} label="Unit" value={product.unit} />}
      {product.expiryDate && <InfoPill icon={Calendar} label="Expires" value={new Date(product.expiryDate).toLocaleDateString()} />}
    </div>
    {product.dietaryInfo?.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {product.dietaryInfo.map((d, i) => <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">{d}</span>)}
      </div>
    )}
    {product.storageInstructions && (
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
        <strong>Storage:</strong> {product.storageInstructions}
      </div>
    )}
    {product.nutritionalInfo && (
      <Collapsible title="Nutritional Information" icon={Info}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {product.nutritionalInfo.calories && <div className="text-center p-3 bg-slate-50 rounded-lg"><p className="text-lg font-bold text-slate-900">{product.nutritionalInfo.calories}</p><p className="text-[10px] text-slate-400 uppercase">Calories</p></div>}
          {product.nutritionalInfo.protein && <div className="text-center p-3 bg-slate-50 rounded-lg"><p className="text-lg font-bold text-slate-900">{product.nutritionalInfo.protein}</p><p className="text-[10px] text-slate-400 uppercase">Protein</p></div>}
          {product.nutritionalInfo.fat && <div className="text-center p-3 bg-slate-50 rounded-lg"><p className="text-lg font-bold text-slate-900">{product.nutritionalInfo.fat}</p><p className="text-[10px] text-slate-400 uppercase">Fat</p></div>}
          {product.nutritionalInfo.carbs && <div className="text-center p-3 bg-slate-50 rounded-lg"><p className="text-lg font-bold text-slate-900">{product.nutritionalInfo.carbs}</p><p className="text-[10px] text-slate-400 uppercase">Carbs</p></div>}
        </div>
      </Collapsible>
    )}
  </div>
);

/* ─── Building Material Section ─── */
const BuildingMaterialDetails = ({ product }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {product.materialType && <InfoPill icon={Package} label="Material" value={product.materialType} />}
    {product.dimensions && <InfoPill icon={Info} label="Dimensions" value={product.dimensions} />}
    {product.grade && <InfoPill icon={Zap} label="Grade" value={product.grade} />}
    {product.weightPerUnit && <InfoPill icon={Package} label="Weight/Unit" value={product.weightPerUnit} />}
    {product.color && <InfoPill icon={Info} label="Color" value={product.color} />}
    {product.usage && <InfoPill icon={Info} label="Usage" value={product.usage} />}
  </div>
);

/* ─── Electronics Section ─── */
const ElectronicsDetails = ({ product }) => (
  <div className="grid grid-cols-2 gap-3">
    {product.energyRating && <InfoPill icon={Zap} label="Energy Rating" value={product.energyRating} />}
    {product.capacity && <InfoPill icon={Package} label="Capacity" value={product.capacity} />}
  </div>
);

/* ─── Page Skeleton ─── */
const ProductPageSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Bar Skeleton */}
      <div className="flex gap-2 mb-8">
        <SkeletonBase className="h-4 w-16 rounded-full" />
        <SkeletonBase className="h-4 w-24 rounded-full" />
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Left: Gallery Skeleton */}
        <div className="space-y-6">
          <SkeletonBase className="aspect-[4/5] md:aspect-square w-full rounded-[2.5rem]" />
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => <SkeletonBase key={i} className="w-20 h-20 rounded-2xl" />)}
          </div>
        </div>

        {/* Right: Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <SkeletonBase className="h-10 w-3/4 rounded-xl" />
            <SkeletonBase className="h-4 w-1/4 rounded-lg" />
          </div>

          <SkeletonBase className="h-24 w-full rounded-3xl" />

          <div className="space-y-2">
            <SkeletonBase className="h-4 w-full rounded-lg" />
            <SkeletonBase className="h-4 w-5/6 rounded-lg" />
            <SkeletonBase className="h-4 w-4/6 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SkeletonBase className="h-12 w-full rounded-xl" />
            <SkeletonBase className="h-12 w-full rounded-xl" />
          </div>

          <SkeletonBase className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

/* ─── MAIN PAGE ─── */
const ProductPage = () => {
  const { id } = useParams();
  const { fetchProduct, currentProduct: product, productLoading, productError, clearProduct } = useProductStore();
  const { authenticationState, user } = useAuthStore();
  const { loading: cartLoading } = useCartStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedDates, setSelectedDates] = useState([]);
  const [groupSize, setGroupSize] = useState(1);
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchReviews = async (pageNum, append = false) => {
    try {
      setLoadingMore(true);
      const res = await fetch(`${REVIEW_API}/${id}?page=${pageNum}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(prev => append ? [...prev, ...data.reviews] : data.reviews);
        setTotalPages(data.totalPages);
        setPage(data.currentPage);
      }
    } catch (err) {
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProduct(id);
    fetchReviews(1);
    return () => clearProduct();
  }, [id, fetchProduct, clearProduct]);

  // Check if user can review
  useEffect(() => {
    if (authenticationState && id) {
      fetch(`${REVIEW_API}/${id}/can-review`, { credentials: 'include' })
        .then(r => r.json())
        .then(d => { 
          setCanReview(d.canReview); 
          setReviewReason(d.reason || ""); 
          if (d.alreadyReviewed) {
            setUserReview(d.review);
          }
        })
        .catch(() => { });
    }
  }, [authenticationState, id]);

  useEffect(() => {
    if (product) document.title = `${product.name} | Triple Portion`;
  }, [product]);

  const cat = product?.category;
  const isAvailable = useMemo(() => {
    if (product?.availabilityStatus !== "Available" || product?.adminDisabled) return false;
    if (cat === "Tour" || cat === "Accommodation") {
      const maxGroup = product.maxGroupSize || 1;
      const normalizedBooked = (product.bookedDates || []).map(d => new Date(d).toISOString().split('T')[0]);
      
      const slotMap = {};
      if (cat === "Tour" && product.dateSlots) {
        product.dateSlots.forEach(s => {
          const key = new Date(s.date).toISOString().split('T')[0];
          slotMap[key] = s.bookedCount || 0;
        });
      }

      const validDates = (product.availableDates || [])
        .map(d => new Date(d).toISOString().split('T')[0])
        .filter(d => {
          if (cat === "Tour") {
            const booked = slotMap[d] || 0;
            return booked < maxGroup;
          }
          return !normalizedBooked.includes(d);
        });

      return validDates.length > 0;
    }
    return product.stock > 0;
  }, [product, cat]);

  const handleAddToCart = async () => {
    if ((cat === "Tour" || cat === "Accommodation") && selectedDates.length === 0) {
      toast.error(`Please select at least one available date for this ${cat.toLowerCase()}`);
      return;
    }

    const cartItem = { ...product, selectedDates };
    if (cat === "Tour") {
      cartItem.groupSize = groupSize;
    }
    const finalQty = (cat === "Tour" || cat === "Accommodation") ? 1 : qty;

    if (authenticationState) {
      await useCartStore.getState().addItemServer(cartItem, finalQty);
    } else {
      useCartStore.getState().addItemGuest(cartItem, finalQty);
    }
    useCartStore.getState().openCart();
  };

  const handleSubmitReview = async () => {
    if (!reviewRating || !reviewComment.trim()) { toast.error("Please provide a rating and comment"); return; }
    setReviewSubmitting(true);
    try {
      const url = isEditing ? `${REVIEW_API}/${userReview._id}` : `${REVIEW_API}/${id}`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success(isEditing ? "Review updated!" : "Review submitted!");
      
      if (isEditing) {
        setReviews(prev => prev.map(r => r._id === userReview._id ? data.review : r));
        setUserReview(data.review);
        setIsEditing(false);
      } else {
        setReviews(prev => [data.review, ...prev]);
        setCanReview(false);
        setUserReview(data.review);
      }
      setReviewRating(0); setReviewComment("");
    } catch (err) { toast.error(err.message || "Failed to submit review"); }
    setReviewSubmitting(false);
  };

  const startEditing = () => {
    setIsEditing(true);
    setReviewRating(userReview.rating);
    setReviewComment(userReview.comment);
  };

  if (productLoading) return <ProductPageSkeleton />;

  if (productError) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-lg text-slate-600">{productError}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
      </div>
    </div>
  );

  if (!product) return null;

  const vendor = product.vendorId;
  const vendorName = vendor?.businessDetails?.businessName || "Vendor";
  const isService = cat === "Tour" || cat === "Accommodation";
  const priceLabel = cat === "Tour" ? "/person" : cat === "Accommodation" ? "/night" : "";

  return (
    <div className="min-h-screen bg-white">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10"
      >
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: Gallery */}
          <ImageGallery images={product.images} />

          {/* Right: Info */}
          <div className="flex flex-col">
            {/* Breadcrumb / Category */}
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-rose-500">{cat}</span>
              {product.brand && (
                <>
                  <span>/</span>
                  <span>{product.brand}</span>
                </>
              )}
            </nav>

            {/* Title & Badge */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isFavorite ? "border-rose-100 bg-rose-50 text-rose-500" : "border-slate-100 text-slate-300 hover:text-rose-400"}`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? "fill-rose-500" : ""}`} />
                </motion.button>
              </div>
              <div className="flex items-center gap-4">
                <RatingStars rating={product.rating || 0} count={product.numReviews || 0} />
                <div className="h-4 w-px bg-slate-200" />
                <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border-2 w-fit ${isAvailable
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                    : "bg-rose-50 border-rose-100 text-rose-600"
                  }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {isAvailable ? "Available Now" : (cat === "Tour" || cat === "Accommodation" ? "Fully Booked" : "Out of Stock")}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-slate-50/50 rounded-3xl p-6 mb-6 border border-slate-100">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-slate-900 tracking-tight">
                  UGX {(product.discountedPrice || product.price)?.toLocaleString()}
                </span>
                {priceLabel && <span className="text-sm font-bold text-slate-400">{priceLabel}</span>}
              </div>
              {product.discountedPrice && product.discountedPrice < product.price && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base text-slate-400 line-through font-bold">UGX {product.price?.toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                    Save {Math.round((1 - product.discountedPrice / product.price) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-slate-600 leading-relaxed text-base font-medium opacity-80">{product.description}</p>
            </div>

            {/* Actions Section */}
            <div className="space-y-6">
              {/* Category-Specific UI */}
              <div className="bg-white rounded-3xl border border-slate-100 p-1">
                {cat === "Tour" && <TourDetails product={product} selectedDates={selectedDates} setSelectedDates={setSelectedDates} groupSize={groupSize} setGroupSize={setGroupSize} />}
                {cat === "Accommodation" && <AccommodationDetails product={product} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />}
                {cat === "Grocery" && <GroceryDetails product={product} />}
                {(cat === "Building Material / Plumbing" || cat === "Building Material") && <BuildingMaterialDetails product={product} />}
                {(cat === "Electronics" || cat === "Home Appliances") && <ElectronicsDetails product={product} />}
              </div>

              {/* Quantity & Buy Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {!isService && product.stock > 0 && (
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-2xl border border-slate-100 sm:w-32">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-rose-500 transition-colors font-bold">−</button>
                    <span className="text-sm font-bold text-slate-900">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-rose-500 transition-colors font-bold">+</button>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={(!isAvailable) || cartLoading}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                  {cartLoading ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-6 h-6" />
                  )}
                  <span className="text-lg">{isService ? "Book Now" : "Add to Cart"}</span>
                </motion.button>
              </div>

              {/* Trust & Vendor */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Shipping</p>
                    <p className="text-xs font-bold text-slate-900">Calculated at checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Security</p>
                    <p className="text-xs font-bold text-slate-900">Protected payment</p>
                  </div>
                </div>
              </div>

              {/* Vendor Card */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {vendorName[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-rose-400 tracking-tighter leading-none">Sold by</p>
                    <p className="text-sm font-bold text-slate-900">{vendorName}</p>
                  </div>
                </div>
                <Link to={`/vendor/${vendor?._id}`} className="px-4 py-2 bg-white text-rose-600 text-xs font-bold rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                  Visit Store
                </Link>
              </div>
            </div>
          </div>
        </div>


        {/* Bottom Sections */}
        <div className="mt-10 space-y-4">
          {/* Dynamic Specifications Title */}
          {product.specifications?.length > 0 && (
            <Collapsible
              title={
                product.category === 'Accommodation' ? 'Rules & Policies' :
                  product.category === 'Tour' ? 'Itinerary & Policies' :
                    product.category === 'Grocery' ? 'Product Details' :
                      ['Electronics', 'BuildingMaterial'].includes(product.category) ? 'Technical Specifications' :
                        'Specifications'
              }
              icon={Info}
              defaultOpen
            >
              <div className="mt-3 divide-y divide-slate-50">
                {product.specifications.map((s, i) => (
                  <div key={i} className="flex justify-between py-2.5">
                    <span className="text-sm text-slate-500">{s.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </Collapsible>
          )}

          {/* Features */}
          {product.features?.length > 0 && (
            <Collapsible title="Key Features" icon={Zap} defaultOpen>
              <ul className="space-y-2 mt-3">
                {product.features.map((f, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{f}</li>)}
              </ul>
            </Collapsible>
          )}

          {/* Warranty */}
          {product.warranty?.hasWarranty && (
            <Collapsible title="Warranty Information" icon={ShieldCheck}>
              <div className="mt-3 space-y-2">
                <div className="flex gap-6">
                  {product.warranty.duration && <div><p className="text-[10px] text-slate-400 uppercase font-semibold">Duration</p><p className="text-sm font-bold text-slate-900">{product.warranty.duration} months</p></div>}
                  {product.warranty.type && <div><p className="text-[10px] text-slate-400 uppercase font-semibold">Type</p><p className="text-sm font-bold text-slate-900">{product.warranty.type}</p></div>}
                </div>
                {product.warranty.conditions?.length > 0 && (
                  <ul className="space-y-1 mt-2">{product.warranty.conditions.map((c, i) => <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5"><span className="text-slate-300">•</span>{c}</li>)}</ul>
                )}
              </div>
            </Collapsible>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {product.tags.map((t, i) => <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{t}</span>)}
            </div>
          )}
        </div>

        {/* ─── Reviews Section ─── */}
        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-900">Reviews ({reviews.length})</h2>
          </div>

          {/* Review Form */}
          {authenticationState && (canReview || isEditing) && (
            <div className="mb-8 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{isEditing ? "Edit Your Review" : "Write a Review"}</h3>
                {isEditing && (
                  <button onClick={() => { setIsEditing(false); setReviewRating(0); setReviewComment(""); }} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline">
                    Cancel Edit
                  </button>
                )}
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onMouseEnter={() => setReviewHover(s)} onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(s)} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`w-8 h-8 transition-colors ${s <= (reviewHover || reviewRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  </button>
                ))}
                {reviewRating > 0 && <span className="text-sm font-bold text-amber-500 ml-3 self-center">{reviewRating}/5</span>}
              </div>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4}
                className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-rose-500/30 focus:ring-4 focus:ring-rose-500/5 resize-none bg-white transition-all"
                placeholder="Share your detailed experience with this product..." />
              <button onClick={handleSubmitReview} disabled={reviewSubmitting}
                className="mt-4 flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 text-white text-sm font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 uppercase tracking-widest">
                <Send className="w-4 h-4" /> {reviewSubmitting ? (isEditing ? "Updating..." : "Submitting...") : (isEditing ? "Update Review" : "Post Review")}
              </button>
            </div>
          )}
          {authenticationState && !canReview && !isEditing && (
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                    <Check className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Thanks for your feedback!</p>
                    <p className="text-xs text-slate-500 font-medium">{reviewReason}</p>
                 </div>
               </div>
               {userReview && (
                 <button 
                  onClick={startEditing}
                  className="px-6 py-3 bg-white border border-rose-100 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm uppercase tracking-widest"
                 >
                   Edit My Review
                 </button>
               )}
            </div>
          )}
          {!authenticationState && <p className="mb-10 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Log in to leave a review</p>}

          {/* Review List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {reviews.map((r, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i % 5 * 0.1 }}
                    key={r._id}
                    className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-rose-200">
                        {(r.userId?.username || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{r.userId?.username || "Anonymous"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"}`} />)}
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">•</span>
                          <p className="text-[10px] text-slate-400 font-bold">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{r.comment}"</p>
                  </motion.div>
                ))}
              </div>

              {page < totalPages && (
                <div className="flex justify-center pt-6">
                  <button 
                    onClick={() => fetchReviews(page + 1, true)}
                    disabled={loadingMore}
                    className="px-10 py-4 bg-white border-2 border-slate-100 text-slate-900 text-sm font-bold rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-all shadow-sm uppercase tracking-widest disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load More Reviews"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default ProductPage;
