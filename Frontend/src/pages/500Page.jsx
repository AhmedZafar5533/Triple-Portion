import React from "react";
import { RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Error500Page = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center text-center relative overflow-hidden px-6">
            {/* Background decoration */}
            <div className="absolute top-1/4 -left-20 w-64 h-64 bg-rose-100/50 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-100 rounded-full blur-3xl opacity-30"></div>

            {/* Main content */}
            <div className="space-y-8 z-10 max-w-2xl">
                <div className="relative inline-block">
                    <h1 className="text-8xl md:text-9xl font-bold text-slate-200 dark:text-slate-800/20 tracking-tighter select-none">
                        500
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-rose-600 bg-white px-4 py-1 rounded-full shadow-sm border border-rose-100">Server Error</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">
                        Something went wrong
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Our servers are having a momentary problem. We're working hard to fix it. Please try refreshing the page or come back later.
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-500 text-white font-medium rounded-lg shadow-lg shadow-rose-100 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
                    >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Refresh Page
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-white text-rose-700 border border-rose-100 font-medium rounded-lg shadow-sm hover:bg-rose-50 transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
                    >
                        <Home className="mr-2 h-5 w-5" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-6 text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Triple Portion. All rights reserved.
            </footer>
        </div>
    );
};

export default Error500Page;
