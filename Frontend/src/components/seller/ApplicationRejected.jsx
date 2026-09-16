import React from 'react';
import { motion } from 'framer-motion';
import { FileX, Mail, ShieldAlert } from 'lucide-react';

const ApplicationRejected = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-red-100 dark:shadow-none"
            >
                <FileX size={48} className="text-red-600 dark:text-red-400" />
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tighter"
            >
                Application Rejected
            </motion.h1>

            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md mb-8 leading-relaxed">
                We're sorry, but your vendor application has been rejected by our compliance team.
            </p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl w-full bg-red-50/50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 rounded-2xl p-8 mb-8 text-left"
            >
                <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <ShieldAlert size={20} className="text-red-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 mb-2">Rejection Reason:</h4>
                        <p className="text-gray-800 dark:text-gray-200 font-bold leading-relaxed">
                            {message || "Your application did not meet our current safety or business requirements."}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Need more info?</p>
                <a 
                    href="mailto:support@marbo.com" 
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                    <Mail size={18} /> Contact Support
                </a>
            </div>
        </div>
    );
};

export default ApplicationRejected;
