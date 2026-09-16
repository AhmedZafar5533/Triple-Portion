import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Package, User } from "lucide-react";
import { useVendorStore } from "../../store/vendorStore";
import { SkeletonTable } from '../Skeleton';

const VendorReviews = () => {
  const { reviews, getReviews, loading } = useVendorStore();

  useEffect(() => {
    getReviews();
  }, [getReviews]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Product Reviews</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">See what customers are saying about your products</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 text-center border border-slate-100 dark:border-slate-700">
           <MessageSquare size={48} className="text-slate-200 mx-auto mb-4" />
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">No reviews yet</h3>
           <p className="text-slate-400 text-sm">When customers review your products, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{review.userId?.username || 'Anonymous'}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"} />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <Package size={14} className="text-slate-400" />
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate">{review.productId?.name}</p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
