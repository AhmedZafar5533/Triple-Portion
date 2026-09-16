import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Edit3, Trash2, Package, Search, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, IMG_BASE_URL } from '../../config';
import { toast } from 'sonner';

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingReview, setEditingReview] = useState(null);
    const [editData, setEditData] = useState({ rating: 0, comment: "" });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/my-reviews`, { credentials: "include" });
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews);
            } else {
                toast.error(data.message || "Failed to fetch reviews");
            }
        } catch (err) {
            toast.error("An error occurred while fetching reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReview = async (reviewId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
                credentials: "include"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Review updated successfully");
                setEditingReview(null);
                fetchReviews();
            } else {
                toast.error(data.message || "Failed to update review");
            }
        } catch (err) {
            toast.error("An error occurred");
        }
    };

    const filteredReviews = reviews.filter(review => 
        review.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading your feedback...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Product Reviews</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Manage and track your feedback on products</p>
                </div>
                <div className="relative group w-full md:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search your reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] outline-none text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                    {filteredReviews.map((review) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex items-start gap-5">
                                {/* Product Info */}
                                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                    <img 
                                        src={review.productId?.images?.[0] ? `${IMG_BASE_URL}${review.productId.images[0]}` : null} 
                                        alt="" 
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white truncate leading-tight">{review.productId?.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{review.productId?.category}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                                            <Star size={12} className="text-amber-500 fill-amber-500" />
                                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{review.rating}.0</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 relative">
                                        <MessageSquare size={14} className="absolute -left-1 -top-1 text-blue-100 dark:text-gray-700 rotate-12" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed italic pl-4">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-4">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingReview(review._id);
                                                    setEditData({ rating: review.rating, comment: review.comment });
                                                }}
                                                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredReviews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-800 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center text-gray-300 mb-6">
                        <MessageSquare size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">No reviews found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                        {searchQuery ? "We couldn't find any reviews matching your search." : "You haven't written any reviews yet. Shared feedback helps the community!"}
                    </p>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingReview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingReview(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-2xl border border-white/20"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Your Review</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Rating Score</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setEditData({ ...editData, rating: star })}
                                                className={`p-2 rounded-xl transition-all ${
                                                    editData.rating >= star 
                                                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                                                    : 'text-gray-300 bg-gray-50 dark:bg-gray-900/50'
                                                }`}
                                            >
                                                <Star size={24} fill={editData.rating >= star ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Feedback Details</label>
                                    <textarea
                                        value={editData.comment}
                                        onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                                        placeholder="Share your experience with this product..."
                                        rows={4}
                                        className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium dark:text-white"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setEditingReview(null)}
                                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleUpdateReview(editingReview)}
                                        className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                                    >
                                        Update Review
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyReviews;
