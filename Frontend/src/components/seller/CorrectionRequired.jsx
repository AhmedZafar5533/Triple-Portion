import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, FileEdit, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const CorrectionRequired = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-amber-100 dark:shadow-none"
            >
                <FileEdit size={48} className="text-amber-600 dark:text-amber-400" />
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tighter"
            >
                Correction Required
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl w-full bg-white dark:bg-gray-800 border-2 border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 mb-8 text-left shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <MessageSquare size={20} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-2">Message from Admin:</h4>
                        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                            {message || "Please review your application details and documents. Some information is missing or needs clarification."}
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
            >
                <Link
                    to="/onboarding"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-amber-100 dark:shadow-none transition-all transform active:scale-95"
                >
                    Update Application <ArrowRight size={20} />
                </Link>
            </motion.div>

            <p className="mt-8 text-sm text-gray-500 font-medium italic">
                Our team is waiting for your updates to proceed with the verification.
            </p>
        </div>
    );
};

export default CorrectionRequired;
