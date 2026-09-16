import React, { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import { SkeletonTable } from '../Skeleton';
import Pagination from '../dashboard/Pagination';

const Reviews = () => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { reviews, getReviews, loading, pagination } = useAdminStore();
  const { totalPages, totalItems } = pagination.reviews;

  useEffect(() => {
    getReviews(currentPage, 10);
  }, [getReviews, currentPage]);

  const openModal = (review) => {
    setSelectedReview(review);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedReview(null);
    setModalOpen(false);
  };

  if (loading && reviews.length === 0) {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <SkeletonTable rows={5} cols={5} />
        </div>
    );
  }

  return (
    <div className="space-y-6 mb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Reviews</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitor customer feedback and product ratings ({totalItems})</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-700">
                <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-rose-50/20 dark:hover:bg-gray-700/50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{review.userId?.username || 'Deleted User'}</div>
                            <div className="text-xs text-gray-500">{review.userId?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{review.productId?.name || 'Deleted Product'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                ))}
                                <span className="ml-2 text-xs font-bold text-gray-400">{review.rating}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{review.comment}</td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => openModal(review)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg transition-colors font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                            >
                                Details
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">No reviews found</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      {modalOpen && selectedReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Review Details</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit log review</p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg">
                        {selectedReview.userId?.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">@{selectedReview.userId?.username}</p>
                        <p className="text-xs text-slate-400">{selectedReview.userId?.email}</p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Product Information</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedReview.productId?.name || 'N/A'}</p>
                </div>

                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rating & Feedback</p>
                    <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={18} className={i < selectedReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                        ))}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-50 dark:border-slate-700">
                        "{selectedReview.comment}"
                    </p>
                </div>

                <div className="flex justify-end">
                    <button onClick={closeModal} className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl cursor-pointer transition-transform hover:scale-105 active:scale-95">
                        Done Reading
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
