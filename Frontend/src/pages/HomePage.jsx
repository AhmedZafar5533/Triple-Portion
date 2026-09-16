import React, { useState, useEffect, useMemo } from "react";
import {
    ShoppingCart,
    Heart,
    Search,
    ChevronRight,
    Star,
    TrendingUp,
    Truck,
    ShieldCheck,
    ArrowRight,
    Package,
    Tag,
    Sparkles,
    Clock,
    MapPin,
    ArrowUpRight,
    Zap,
    ChevronLeft,
    Cpu,
    Home,
    ShoppingBasket,
    Hammer,
    Bed,
    Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "../store/productsStore";
import { useServiceStore } from "../store/serviceStore";
import { SkeletonCard, SkeletonBase } from "../components/Skeleton";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { API_BASE_URL, IMG_BASE_URL } from "../config";

const IMG_BASE = IMG_BASE_URL;

const getCategoryIcon = (name) => {
    const map = {
        'Electronics': <Cpu className="w-6 h-6 md:w-8 md:h-8" />,
        'Home Appliances': <Home className="w-6 h-6 md:w-8 md:h-8" />,
        'Grocery': <ShoppingBasket className="w-6 h-6 md:w-8 md:h-8" />,
        'Building Material': <Hammer className="w-6 h-6 md:w-8 md:h-8" />,
        'Accommodation': <Bed className="w-6 h-6 md:w-8 md:h-8" />,
        'Tour': <Compass className="w-6 h-6 md:w-8 md:h-8" />,
    };
    return map[name] || <Package className="w-6 h-6 md:w-8 md:h-8" />;
};

/* ───────────── PROMO STRIP ───────────── */
const PromoStrip = ({ threshold }) => (
    <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-6 text-xs md:text-sm">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
                <Truck className="w-4 h-4 text-rose-400" />
                <span>{threshold > 0 ? `Free shipping on orders over UGX ${threshold.toLocaleString()}` : "Low-cost shipping on all orders"}</span>
            </div>
            {/* <div className="flex items-center gap-2 font-bold text-rose-400">
                <Zap className="w-4 h-4" />
                <span>Flash deals — up to 30% off selected items</span>
            </div> */}
            <div className="hidden md:flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>Verified vendors only</span>
            </div>
        </div>
    </div>
);

/* ───────────────────── HERO ───────────────────── */
const HeroSection = ({ products }) => {
    const bannerProducts = products.slice(0, 5);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (bannerProducts.length > 0) {
            const timer = setInterval(() => {
                setCurrent((prev) => (prev + 1) % bannerProducts.length);
            }, 6000);
            return () => clearInterval(timer);
        }
    }, [bannerProducts.length]);

    const goTo = (dir) => {
        if (bannerProducts.length > 0) {
            setCurrent((prev) => (prev + dir + bannerProducts.length) % bannerProducts.length);
        }
    };

    if (!bannerProducts.length) return null;

    return (
        <div className="relative overflow-hidden bg-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]">
                    <AnimatePresence>
                        <motion.div
                            key={current}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0"
                        >
                            {/* Background Image for Mobile/Tablet */}
                            <div className="absolute inset-0 md:hidden overflow-hidden">
                                {bannerProducts[current].images?.[0] && (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-[2px] opacity-20"
                                        style={{ backgroundImage: `url(${IMG_BASE}${bannerProducts[current].images[0]})` }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900" />
                            </div>

                            <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
                            {/* Subtle pattern overlay */}
                            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                            <div className="relative h-full grid md:grid-cols-2 items-center px-6 sm:px-10 lg:px-16">
                                {/* Text Side */}
                                <div className="space-y-4 md:space-y-6 z-10 py-10 md:py-0 text-center md:text-left">
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="inline-block px-3 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-md"
                                    >
                                        Featured Product
                                    </motion.span>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight"
                                    >
                                        {bannerProducts[current].name}
                                    </motion.h1>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="space-y-3"
                                    >
                                        <p className="text-sm md:text-base text-slate-300 max-w-md mx-auto md:mx-0 leading-relaxed line-clamp-3">
                                            {bannerProducts[current].description}
                                        </p>
                                        <div className="text-2xl md:text-3xl font-bold text-rose-500">
                                            {bannerProducts[current].discountedPrice && bannerProducts[current].discountedPrice < bannerProducts[current].price ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm md:text-base text-slate-400 line-through mr-3 font-semibold">UGX {bannerProducts[current].price?.toLocaleString()}</span>
                                                    UGX {bannerProducts[current].discountedPrice?.toLocaleString()}
                                                </div>
                                            ) : (
                                                <>UGX {bannerProducts[current].price?.toLocaleString()}</>
                                            )}
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4"
                                    >
                                        <Link to={`/product/${bannerProducts[current]._id}`} className="px-8 py-4 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/25 flex items-center gap-2">
                                            View Details <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </motion.div>
                                </div>

                                {/* Image Side */}
                                <div className="absolute inset-0 md:relative md:flex items-center justify-center h-full pointer-events-none md:pointer-events-auto">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="relative w-full h-full flex items-center justify-center p-6 md:p-12"
                                    >
                                        <div className="absolute w-[60%] md:w-[70%] aspect-square rounded-full bg-rose-500/10 blur-[60px] md:blur-[100px]" />
                                        {bannerProducts[current].images?.[0] && (
                                            <img
                                                src={`${IMG_BASE}${bannerProducts[current].images[0]}`}
                                                alt={bannerProducts[current].name}
                                                className="relative z-10 max-h-[50%] md:max-h-[85%] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:drop-shadow-[0_30px_70px_rgba(0,0,0,0.5)] opacity-40 md:opacity-100"
                                            />
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Arrow Controls - Pulled to the side */}
                    <button
                        onClick={() => goTo(-1)}
                        className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-all z-20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => goTo(1)}
                        className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-all z-20"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-20">
                        {bannerProducts.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${current === i ? "w-10 bg-rose-600" : "w-2.5 bg-white/20 hover:bg-white/40"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ───────────── VALUE STRIP (below hero) ───────────── */
const ValueStrip = ({ threshold }) => (
    <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-24">
                {[
                    { icon: <ShieldCheck className="w-5 h-5" />, title: "Secure Payment", desc: "100% protected" },
                    { icon: <Clock className="w-5 h-5" />, title: "24/7 Support", desc: "Dedicated team" },
                    { icon: <Package className="w-5 h-5" />, title: "Easy Returns", desc: "30-day returns" },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg flex-shrink-0">
                            {item.icon}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs md:text-sm truncate">{item.title}</h4>
                            <p className="text-[10px] md:text-xs text-slate-400 truncate">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ───────────── CATEGORY GRID ───────────── */
const CategoryGrid = ({ categories, selectedCategory, onSelectCategory }) => {
    if (!categories || categories.length === 0) return null;

    const fixedCategories = categories.map((c) => ({
        ...c,
        name: c.name === "Building Material / Plumbing" ? "Building Material" : c.name,
    }));

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
                    <p className="text-slate-500 text-sm mt-1">Explore our wide range of services and products</p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {fixedCategories.map((cat) => {
                        const isSelected = selectedCategory === cat.name ||
                            (selectedCategory === 'Building Material / Plumbing' && cat.name === 'Building Material');
                        return (
                            <div
                                key={cat.name}
                                onClick={() => onSelectCategory(isSelected ? null : (cat.name === 'Building Material' ? 'Building Material / Plumbing' : cat.name))}
                                className="flex flex-col items-center cursor-pointer group w-[100px] md:w-[140px]"
                            >
                                <div className={`w-12 h-12 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 ${isSelected
                                    ? "bg-rose-100 text-rose-600 ring-2 ring-rose-500/20"
                                    : "bg-slate-50 text-slate-600 group-hover:bg-rose-50 group-hover:text-rose-600"
                                    }`}>
                                    {getCategoryIcon(cat.name)}
                                </div>
                                <h3 className={`font-bold text-xs md:text-sm text-center leading-tight transition-colors ${isSelected ? "text-rose-600 font-extrabold" : "text-slate-800 group-hover:text-rose-600"
                                    }`}>
                                    {cat.name}
                                </h3>
                                <div className={`px-2 py-0.5 rounded-full mt-2 text-[8px] md:text-[10px] font-bold transition-colors ${isSelected ? "bg-rose-200 text-rose-700" : "bg-slate-100 group-hover:bg-rose-100 text-slate-500 group-hover:text-rose-600"
                                    }`}>
                                    {cat.count} Items
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ───────────── PRODUCT CARD ───────────── */
const checkProductAvailability = (product) => {
    if (product.availabilityStatus !== "Available" || product.adminDisabled) return false;
    const cat = product.category;
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
};

const ProductCard = ({ product, favorites, toggleFavorite }) => (
    <div className="group bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-lg flex flex-col h-full overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50">
            <img
                src={product.images && product.images.length > 0 ? `${IMG_BASE}${product.images[0]}` : null}
                alt={product.name}
                className="w-full h-full object-contain p-3 md:p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
            <button
                onClick={(e) => { e.preventDefault(); toggleFavorite(product._id); }}
                className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:shadow-md transition-all z-10 active:scale-90"
            >
                <Heart className={`w-3.5 h-3.5 transition-colors duration-200 ${favorites.has(product._id) ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
            </button>
            {!checkProductAvailability(product) ? (
                <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-rose-600 text-white text-[9px] font-bold uppercase rounded shadow-sm z-10">
                    {product.category === "Tour" || product.category === "Accommodation" ? "Fully Booked" : "Out of Stock"}
                </div>
            ) : (
                product.category !== "Tour" && product.category !== "Accommodation" && product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded">
                        Only {product.stock} left
                    </div>
                )
            )}
        </div>

        {/* Info */}
        <Link to={`/product/${product._id}`} className="flex-1 p-3 md:p-4 flex flex-col">
            <p className="text-[9px] md:text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 truncate">
                {product.brand || product.category || "General"}
            </p>
            <h3 className="font-medium text-xs md:text-sm text-slate-800 mb-2 line-clamp-2 leading-snug min-h-[2rem] md:min-h-[2.5rem] group-hover:text-rose-600 transition-colors">
                {product.name}
            </h3>
            <div className="flex items-center gap-0.5 mb-3">
                <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    ))}
                </div>
                <span className="text-[9px] text-slate-400 ml-1">({product.numReviews || 0})</span>
            </div>
            <div className="mt-auto">
                <span className="text-sm md:text-lg font-bold text-slate-900">
                    {product.discountedPrice && product.discountedPrice < product.price ? (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] md:text-xs text-slate-400 line-through font-semibold">UGX {product.price?.toLocaleString()}</span>
                            <span>UGX {product.discountedPrice.toLocaleString()}</span>
                        </div>
                    ) : (
                        <span>UGX {product.price?.toLocaleString()}</span>
                    )}
                </span>
            </div>
        </Link>
    </div>
);

/* ───────────── PRODUCT SECTION ───────────── */
const ProductSection = ({ title, subtitle, products, bgClass = "bg-white" }) => {
    const [favorites, setFavorites] = useState(new Set());

    const toggleFavorite = (id) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (!products || products.length === 0) return null;

    return (
        <div className={`${bgClass} py-8 md:py-14`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div>
                        <h2 className="text-lg md:text-2xl font-bold text-slate-900">{title}</h2>
                        {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                    <Link to="/" className="text-rose-600 font-semibold text-xs md:text-sm hover:underline flex items-center gap-1">
                        View All <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} favorites={favorites} toggleFavorite={toggleFavorite} />
                    ))}
                </div>
            </div>
        </div>
    );
};


/* ───────────── SKELETON ───────────── */
const HomePageSkeleton = () => (
    <div className="min-h-screen bg-white">
        {/* Promo strip skeleton */}
        <div className="bg-slate-900 h-10" />

        {/* Hero Skeleton */}
        <div className="bg-slate-800 h-[340px] md:h-[460px]">
            <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="w-full md:w-1/2 space-y-5">
                    <SkeletonBase className="h-5 w-28 rounded-md bg-slate-700" />
                    <SkeletonBase className="h-12 w-full rounded-lg bg-slate-700" />
                    <SkeletonBase className="h-16 w-3/4 rounded-lg bg-slate-700" />
                    <div className="flex gap-3">
                        <SkeletonBase className="h-11 w-28 rounded-lg bg-slate-700" />
                        <SkeletonBase className="h-11 w-28 rounded-lg bg-slate-700" />
                    </div>
                </div>
            </div>
        </div>

        {/* Value strip skeleton */}
        <div className="border-b border-slate-100 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <SkeletonBase className="w-9 h-9 rounded-lg" />
                            <div className="space-y-1.5">
                                <SkeletonBase className="h-3.5 w-20 rounded" />
                                <SkeletonBase className="h-2.5 w-16 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-slate-50/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center mb-8">
                    <SkeletonBase className="h-8 w-48 rounded-lg mb-2" />
                    <SkeletonBase className="h-4 w-64 rounded-md" />
                </div>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center w-[100px] md:w-[140px]">
                            <SkeletonBase className="w-12 h-12 md:w-20 md:h-20 rounded-2xl mb-3" />
                            <SkeletonBase className="h-4 w-16 rounded mb-2" />
                            <SkeletonBase className="h-3 w-10 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Products Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SkeletonBase className="h-7 w-48 rounded mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                        <SkeletonBase className="aspect-square w-full" />
                        <div className="p-3 space-y-2">
                            <SkeletonBase className="h-2.5 w-1/2 rounded" />
                            <SkeletonBase className="h-3.5 w-full rounded" />
                            <SkeletonBase className="h-3 w-16 rounded" />
                            <SkeletonBase className="h-4 w-3/4 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ───────────── MAIN PAGE ───────────── */
const ECommerceMarketplace = () => {
    const {
        fetchDisplayProducts,
        displayProducts,
        trendingProducts,
        newArrivals,
        topPicks,
        categories,
        loading,
        selectedCategory,
        searchQuery
    } = useProductStore();
    const { fetchFrontendServices, activeServicesMap } = useServiceStore();
    const [hasUserData, setHasUserData] = useState(false);

    useEffect(() => {
        document.title = "Triple Portion | Home";
        fetchDisplayProducts();
        fetchFrontendServices();

        const storedUser = localStorage.getItem("user");
        if (storedUser) setHasUserData(true);
    }, [fetchDisplayProducts, fetchFrontendServices]);

    // Calculate a representative threshold (e.g. max one to be safe)
    const representativeThreshold = useMemo(() => {
        const values = Object.values(activeServicesMap)
            .filter(v => v.freeDeliveryThreshold > 0)
            .map(v => v.freeDeliveryThreshold);
        return values.length > 0 ? Math.max(...values) : 0;
    }, [activeServicesMap]);

    const handleCategorySelect = (categoryName) => {
        fetchDisplayProducts({ category: categoryName });
    };

    const resetAllFilters = () => {
        fetchDisplayProducts({});
    };

    if (loading && displayProducts.length === 0) {
        return <HomePageSkeleton />;
    }

    const hasFiltersActive = !!selectedCategory;

    return (
        <div className="min-h-screen bg-slate-50/40">
            <PromoStrip threshold={representativeThreshold} />
            <HeroSection products={displayProducts} />
            <ValueStrip threshold={representativeThreshold} />

            {/* Category Grid */}
            <CategoryGrid
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
            />

            {/* Conditional products view based on filtering state */}
            {hasFiltersActive ? (
                displayProducts.length === 0 ? (
                    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">No matching products found</h3>
                        <p className="text-slate-500 mt-1">Try clearing selected category filters.</p>
                        <button
                            onClick={resetAllFilters}
                            className="mt-4 px-6 py-2.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-rose-700 transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <ProductSection
                        title={selectedCategory ? `${selectedCategory} Collection` : "Search Results"}
                        subtitle={searchQuery ? `Showing matching listings for "${searchQuery}"` : `Browse our available selection`}
                        products={displayProducts}
                    />
                )
            ) : (
                displayProducts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 py-20">
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-rose-500/5 max-w-lg w-full text-center border border-slate-100">
                            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <Package size={48} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 tracking-tight">Nothing Here Yet!</h2>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                                The marketplace is currently empty. Our vendors are working hard to bring you the best products. Check back soon!
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {hasUserData ? (
                            <ProductSection
                                title="Recommended for You"
                                subtitle="Based on your recent browsing"
                                products={topPicks}
                            />
                        ) : (
                            <ProductSection
                                title="Trending This Week"
                                subtitle="Most popular items across the marketplace"
                                products={trendingProducts}
                            />
                        )}

                        <ProductSection
                            title="New Arrivals"
                            subtitle="Freshly added products from trusted vendors"
                            products={newArrivals}
                            bgClass="bg-white"
                        />
                    </>
                )
            )}

            <Footer />
        </div>
    );
};

export default ECommerceMarketplace;
