import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Footer = () => {
    const { user } = useAuthStore();

    return (
        <footer className="bg-gray-900 text-gray-400">
            <div className="py-16 max-w-7xl mx-auto px-6">
                {/* Become a Vendor Section - Integrated inside the main footer container */}
                {!user && (
                    <div className="mb-16 p-8 md:p-12 bg-gray-800/40 rounded-[2.5rem] border border-gray-800 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <span className="inline-block px-3 py-1 bg-rose-600/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-md mb-4 border border-rose-500/20">
                                    Partnership
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                    Start Selling on Triple Portion
                                </h3>
                                <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                                    Join thousands of trusted vendors and reach customers across the region. Easy setup, professional tools, and maximum exposure.
                                </p>
                            </div>
                            <Link to="/signup" className="px-10 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 flex-shrink-0 text-sm hover:scale-105 active:scale-95">
                                Get Started Now →
                            </Link>
                        </div>
                    </div>
                )}

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 mb-16">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Triple Portion</h3>
                        <p className="text-sm leading-relaxed">
                            Triple your money's worth with our curated collection of premium products. Quality meets affordability.
                        </p>
                        <ul className="space-y-3">
                            {["About", "Careers"].map((item) => (
                                <li key={item}>
                                    <Link
                                        to={`/${item.toLowerCase()}`}
                                        className="hover:text-white transition-colors text-sm"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li key="Privacy Policy">
                                <Link
                                    to="/privacy"
                                    className="hover:text-white transition-colors text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li key="Terms of Service">
                                <Link
                                    to="/terms"
                                    className="hover:text-white transition-colors text-sm"
                                >
                                    Terms of Use
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-4">Subscribe</h3>
                        <p className="text-sm">Stay up to date with the latest news and updates</p>
                        <div className="flex mt-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-3 rounded-l-2xl w-full bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-rose-400 text-white outline-none text-sm"
                            />
                            <button className="bg-rose-600 text-white px-5 py-3 rounded-r-2xl hover:bg-rose-500 transition-colors cursor-pointer">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs font-medium">
                    <div className="mb-4 md:mb-0">
                        <p>&copy; {new Date().getFullYear()} Triple Portion. All rights reserved.</p>
                    </div>
                    <div className="flex space-x-8">
                        {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((social) => (
                            <a
                                key={social}
                                href="#"
                                className="hover:text-white transition-colors"
                            >
                                {social}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
