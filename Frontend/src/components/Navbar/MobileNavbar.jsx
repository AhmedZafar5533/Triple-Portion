import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Search, ArrowRight, User, LogOut, Loader2, ShoppingBag, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const MobileNavbar = ({ menuItems, performSearch, isScrolled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const searchInputRef = useRef(null);
    const isOpenRef = useRef(isOpen);
    const isSearchOpenRef = useRef(isSearchOpen);
    const profileMenuRef = useRef(null);
    const debounceRef = useRef(null);

    const { authenticationState: isLoggedIn, sendLogoutRequest, user } = useAuthStore();
    const cartItems = useCartStore(s => s.items);
    const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Update refs when state changes
    useEffect(() => {
        isOpenRef.current = isOpen;
        isSearchOpenRef.current = isSearchOpen;
    }, [isOpen, isSearchOpen]);

    // Handle click outside to close dropdowns and profile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && event.target.closest('.mobile-menu') === null) {
                setIsOpen(false);
            }

            // Close profile menu when clicking outside
            if (showProfileMenu &&
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target) &&
                !event.target.closest('.profile-trigger')) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [isOpen, showProfileMenu]);

    // Focus search input when search overlay opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setIsSearchOpen(false);
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) setIsOpen(false);
    };

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const toggleDropdown = (index) => {
        if (activeDropdown === index) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(index);
        }
    };

    // New function to close mobile menu
    const closeMenu = () => {
        setIsOpen(false);
    };

    // Handle search input change (debounced)
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setSearchResults([]);
            setSearchLoading(false);
            return;
        }

        setSearchLoading(true);

        // Debounce the actual API call by 1000ms (1 second)
        debounceRef.current = setTimeout(async () => {
            const results = await performSearch(query);
            setSearchResults(results);
            setSearchLoading(false);
        }, 1000);
    };

    // Handle search submission
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearchLoading(true);
        const results = await performSearch(searchQuery);
        setSearchResults(results);
        setSearchLoading(false);
    };

    return (
        <>
            {/* Floating Bottom Navbar */}
            <div className="fixed bottom-6 left-4 right-4 z-[60] lg:hidden">
                <div className="bg-white/90 backdrop-blur-xl border border-rose-100 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-2 py-3">
                    <div className="grid grid-cols-5 items-center">
                        {/* Menu Trigger */}
                        <button
                            onClick={toggleMenu}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isOpen ? 'text-rose-600 scale-110' : 'text-gray-500 hover:text-rose-500'}`}
                        >
                            <Menu className="h-6 w-6" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Menu</span>
                        </button>

                        {/* Search Trigger */}
                        <button
                            onClick={toggleSearch}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isSearchOpen ? 'text-rose-600 scale-110' : 'text-gray-500 hover:text-rose-500'}`}
                        >
                            <Search className="h-6 w-6" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Search</span>
                        </button>

                        {/* Home/Logo - The prominent center button */}
                        <div className="flex justify-center">
                            <div className="relative -mt-10">
                                <Link
                                    to="/"
                                    className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 shadow-xl border-4 border-white transition-transform active:scale-95 group"
                                    onClick={closeMenu}
                                >
                                    <Home className="h-7 w-7 text-white" />
                                    <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                </Link>
                            </div>
                        </div>

                        {/* Cart Trigger */}
                        <button
                            onClick={() => useCartStore.getState().toggleCart()}
                            className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-rose-500 transition-all duration-300 relative"
                        >
                            <div className="relative">
                                <ShoppingBag className="h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium uppercase tracking-wider">Cart</span>
                        </button>

                        {/* Account Trigger */}
                        <Link
                            to={isLoggedIn ? (user?.role === 'admin' ? '/dashboard/admin' : `/dashboard/${user?.role}/profile`) : '/login'}
                            onClick={closeMenu}
                            className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-rose-500 transition-all duration-300"
                        >
                            {isLoggedIn ? (
                                <div className="h-6 w-6 rounded-full overflow-hidden border border-rose-200">
                                    <img
                                        src="https://www.gravatar.com/avatar/?d=mp&s=200"
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <User className="h-6 w-6" />
                            )}
                            <span className="text-[10px] font-medium uppercase tracking-wider">
                                {isLoggedIn ? 'Account' : 'Login'}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 transition-opacity duration-300 ease-in-out">
                    <div className="bg-white shadow-xl rounded-b-2xl">
                        <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
                            <form onSubmit={handleSearchSubmit} className="search-container flex items-center">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-red-500" />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="w-full pl-12 pr-10 py-3 border-2 border-rose-300 rounded-xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                                        placeholder="What are you looking for?"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleSearch}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <X className="h-6 w-6 text-gray-500 hover:text-rose-700" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Results */}
                        {searchQuery.trim() !== '' && (
                            <div className="px-2 pb-6">
                                {searchLoading ? (
                                    <div className="px-4 py-8 text-center">
                                        <Loader2 className="h-6 w-6 text-rose-500 animate-spin mx-auto" />
                                        <p className="text-sm text-gray-400 mt-2">Searching...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                            {searchResults.length} Results
                                        </div>

                                        {searchResults.length > 0 ? (
                                            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                                {searchResults.map((result, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={result.link}
                                                        className="flex items-center gap-3 p-4 hover:bg-rose-50 transition-colors duration-200"
                                                        onClick={() => setIsSearchOpen(false)}
                                                    >
                                                        {result.image && (
                                                            <img src={result.image} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                                        )}
                                                        <div className="flex-grow min-w-0">
                                                            <div className="text-base font-medium text-gray-900 truncate">{result.name}</div>
                                                            <div className="text-sm text-gray-500 truncate">{result.description}</div>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-medium rounded-full">
                                                                    {result.category}
                                                                </span>
                                                                {result.price != null && (
                                                                    <span className="text-xs font-bold text-gray-900">
                                                                        UGX {result.price.toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="h-5 w-5 text-red-500 flex-shrink-0" />
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <p className="text-gray-500">No results found for "{searchQuery}"</p>
                                                <p className="mt-1 text-sm text-gray-400">
                                                    Try different keywords or check spelling
                                                </p>
                                            </div>
                                        )}

                                        {searchResults.length > 0 && (
                                            <div className="px-4 py-3 mt-3 border-t border-gray-200 text-center">
                                                <a
                                                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                                                    className="inline-flex items-center text-rose-600 font-medium"
                                                    onClick={() => setIsSearchOpen(false)}
                                                >
                                                    See all results&nbsp;
                                                    <ArrowRight className="h-4 w-4" />
                                                </a>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Menu Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black transition-opacity duration-400 ease-in-out"
                style={{
                    opacity: isOpen ? 0.6 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
                onClick={toggleMenu}
            />

            {/* Slide-in Menu */}
            <div
                className="fixed inset-y-0 left-0 z-50 w-full max-w-sm h-full bg-white shadow-xl transition-transform duration-400 ease-in-out transform mobile-menu"
                style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                    <div className="text-rose-600 font-bold text-2xl tracking-tight">
                       Triple Portion
                    </div>
                    <button
                        onClick={toggleMenu}
                        className="p-2 rounded-full text-gray-700 hover:text-rose-600 hover:bg-gray-100 transition-colors duration-300"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-y-auto h-full pb-20">
                    <nav className="pt-5 pb-3 px-2">
                        {menuItems.map((item, idx) => (
                            <div key={idx} className="mb-2">
                                {item.submenu.length > 0 ? (
                                    <>
                                        <button
                                            onClick={() => toggleDropdown(idx)}
                                            className="w-full flex justify-between items-center px-4 py-3.5 text-base font-medium text-gray-800 hover:bg-rose-50 rounded-xl transition-colors duration-300"
                                        >
                                            {item.title}
                                            <ChevronDown
                                                className={`ml-1 h-5 w-5 transition-transform duration-400 ease-in-out ${activeDropdown === idx ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                        <div
                                            className="overflow-hidden transition-all duration-400 ease-in-out px-2"
                                            style={{
                                                maxHeight:
                                                    activeDropdown === idx
                                                        ? `${item.submenu.length * 100 + 60}px`
                                                        : '0px',
                                                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                                            }}
                                        >
                                            <div className="py-2 space-y-1 pl-2 mt-1 rounded-xl">
                                                {item.submenu.map((sub, sIdx) => (
                                                    <a
                                                        key={sIdx}
                                                        href={sub.link || '#'}
                                                        className="flex items-start px-4 py-3 text-base text-gray-700 hover:bg-rose-50 rounded-xl transition-colors duration-300"
                                                        onClick={closeMenu}
                                                    >
                                                        <div>
                                                            <div className="font-medium">{sub.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {sub.description}
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))}
                                                <div className="pt-3 pb-1 pl-4">
                                                    <a
                                                        href='/'
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-300"
                                                        onClick={closeMenu}
                                                    >
                                                        Browse more&nbsp;
                                                        <ArrowRight className="ml-1 h-4 w-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <a
                                        href={item.link}
                                        className="block px-4 py-3.5 text-base font-medium text-gray-800 hover:bg-rose-50 rounded-xl transition-colors duration-300"
                                        onClick={closeMenu}
                                    >
                                        {item.title}
                                    </a>
                                )}
                            </div>
                        ))}
                    </nav>

                    <div className="px-6 pt-6 pb-8 border-t border-gray-200">
                        {!isLoggedIn ? (
                            <>
                                <a href="/login" onClick={closeMenu}>
                                    <button className="mb-2 w-full px-4 py-3 text-center text-sm font-medium text-gray-700 hover:text-rose-600 border border-gray-300 rounded-xl transition-colors duration-300">
                                        Login
                                    </button>
                                </a>
                                <a href="/signup" onClick={closeMenu}>
                                    <button className="w-full px-4 py-3 text-center text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                                        Sign up
                                    </button>
                                </a>
                            </>
                        ) : (
                            <button
                                className="w-full px-4 py-3 text-center text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                                onClick={() => {
                                    sendLogoutRequest();
                                    setShowProfileMenu(false);
                                    closeMenu();
                                }}
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNavbar;
