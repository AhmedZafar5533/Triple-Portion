import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="mt-8 flex justify-center items-center gap-4">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-sm"
            >
                Previous
            </button>
            
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Page</span>
                <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm font-bold">
                    {currentPage}
                </span>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">of {totalPages}</span>
            </div>

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-sm"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
