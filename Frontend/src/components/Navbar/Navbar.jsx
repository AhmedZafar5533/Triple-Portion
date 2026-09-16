import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useServiceStore } from "../../store/serviceStore";

const DesktopNavbar = lazy(() => import("./DesktopNavbar"));
const MobileNavbar = lazy(() => import("./MobileNavbar"));
import { API_BASE_URL } from "../../config";

// Loading Skeleton Component
const NavbarSkeleton = ({ isScrolled }) => (
  <div
    className={`transition-shadow duration-300 ${
      isScrolled ? "shadow-lg" : "shadow-md"
    }`}
  >
    {/* Desktop Skeleton */}
    <div className="hidden lg:block bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-[height] duration-300 ${
          isScrolled ? "h-20 md:h-16 lg:h-18" : "h-22 md:h-18 lg:h-20"
        }`}>
          <div className="flex items-center">
            <div className="w-32 h-8 bg-gradient-to-r from-rose-200 via-rose-100 to-rose-200 rounded-md animate-pulse" />
          </div>
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-6 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-9 bg-rose-100 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Skeleton */}
    <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl border border-rose-100 rounded-3xl shadow-lg px-2 py-4">
        <div className="flex justify-around items-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error State Component
const NavbarError = ({ onRetry, isScrolled }) => (
  <div
    className={`bg-white transition-shadow duration-300 ${
      isScrolled ? "shadow-lg" : "shadow-md"
    }`}
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className={`flex justify-between items-center transition-[height] duration-300 ${
        isScrolled ? "h-20 md:h-16 lg:h-18" : "h-22 md:h-18 lg:h-20"
      }`}>
        {/* Logo - Always show */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-rose-600">
            Triple Portion
          </Link>
        </div>

        {/* Basic Menu (fallback) */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link
            to="/"
            className="text-gray-700 hover:text-rose-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/contact-us"
            className="text-gray-700 hover:text-rose-600 transition-colors"
          >
            Contact
          </Link>
          <button
            onClick={onRetry}
            className="text-sm text-rose-600 hover:text-rose-700 underline transition-colors"
            title="Retry loading services"
          >
            Retry Services
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            to="/login"
            className="text-gray-700 hover:text-rose-600 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            className="text-gray-700 hover:text-rose-600 transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchCacheRef = useRef({});
  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { activeServices, fetchActiveServices, loading, error } = useServiceStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    fetchActiveServices();
  }, []);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          setIsScrolled((prev) => {
            if (y > 60) return true;
            if (y < 20) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Service descriptions mapping
  const serviceDescriptions = {
    Groceries: {
      description: "Fresh produce and essentials from trusted local markets",
      tags: ["food", "supermarket", "fruits", "vegetables", "essentials"],
    },
    "Utility Payments": {
      description: "Pay electricity, gas, and utility bills with ease",
      tags: ["electricity", "gas", "water", "bills", "payment"],
    },
    "Water Bill Payments": {
      description: "Convenient water service payments from anywhere",
      tags: ["water", "bill", "payment", "utilities"],
    },
    "Interior Design": {
      description: "Professional home styling and decoration services",
      tags: ["home", "interior", "decoration", "design", "furniture"],
    },
    "Traditional Clothing": {
      description: "Authentic Gomesi, Kanzu, and cultural attire",
      tags: ["fashion", "clothing", "traditional", "attire", "garments"],
    },
    "Holiday Lets": {
      description: "Book short-term stays and vacation rental homes",
      tags: ["vacation", "rental", "holiday", "accommodation", "travel"],
    },
    "Arts & Crafts": {
      description: "Handmade cultural pieces and artisan crafts",
      tags: ["crafts", "art", "handmade", "cultural", "decor"],
    },
    "Fashion Services": {
      description: "Contemporary and traditional fashion design",
      tags: ["fashion", "design", "style", "clothing", "apparel"],
    },
    "Hotel Booking": {
      description: "Find and book premium accommodations quickly",
      tags: ["hotel", "booking", "stay", "accommodation", "travel"],
    },
    "Medical Care": {
      description: "Access quality healthcare professionals and services",
      tags: ["doctor", "health", "clinic", "hospital", "medical"],
    },
    "Domestic Staffing": {
      description: "Hire verified house helps, cleaners, and staff",
      tags: ["staff", "domestic", "house help", "cleaning", "services"],
    },
    "Properties for Sale": {
      description: "Explore premium real estate listings and investments",
      tags: ["property", "sale", "real estate", "investment", "house"],
    },
    "Rental Properties": {
      description: "Verified rental homes and rent-to-own options",
      tags: ["property", "rental", "house", "lease", "rent"],
    },
    "Land Acquisition": {
      description: "Secure land listings and property transactions",
      tags: ["land", "purchase", "real estate", "plot", "investment"],
    },
    "Property Management": {
      description: "Professional property management and maintenance",
      tags: ["property", "management", "maintenance", "house", "rent"],
    },
    "School Fee Payments": {
      description: "Seamless and secure school fee transactions",
      tags: ["school", "education", "fees", "payment", "tuition"],
    },
    "Mortgage Services": {
      description: "Diaspora-focused mortgage and loan solutions",
      tags: ["mortgage", "loan", "finance", "banking", "home"],
    },
    "Banking Services": {
      description: "Banking products tailored for your needs",
      tags: ["banking", "finance", "account", "loan", "payment"],
    },
    "Rent Collection": {
      description: "Efficient and secure rental income collection",
      tags: ["rent", "collection", "property", "finance", "payment"],
    },
    "Tech Supplies": {
      description: "Laptops, smartphones, and tech accessories",
      tags: ["tech", "gadgets", "electronics", "computer", "smartphone"],
    },
    "Telecom Services": {
      description: "Mobile money and telecommunications solutions",
      tags: ["telecom", "mobile", "phone", "internet", "communication"],
    },
    "Construction Services": {
      description: "Certified builders and construction contractors",
      tags: ["construction", "builders", "contractor", "building", "home"],
    },
    "Hardware Suppliers": {
      description: "Quality building materials and construction supplies",
      tags: ["hardware", "construction", "tools", "building", "materials"],
    },
    "Agricultural Services": {
      description: "Farming tools, equipment, and management services",
      tags: ["agriculture", "farming", "equipment", "tools", "crops"],
    },
    "Event Management": {
      description: "Full-service event planning and coordination",
      tags: ["event", "planning", "party", "wedding", "management"],
    },
    "Health Insurance": {
      description: "Comprehensive health coverage from trusted providers",
      tags: ["insurance", "health", "medical", "coverage", "policy"],
    },
    "Money Transfer Services": {
      description: "Best rates for international money transfers",
      tags: ["money", "transfer", "remittance", "finance", "payment"],
    },
  };

  const generateDynamicSubmenu = () => {
    if (!activeServices || !Array.isArray(activeServices)) {
      return [];
    }

    // Map backend services to the format expected by the menu
    const mappedServices = activeServices.map((service) => {
      const fullName = service.name;
      const parts = fullName.split(' / ');
      const displayName = parts[0];
      const extraInfo = parts.slice(1).join(' / ');

      const simpleKey = displayName;
      const info = serviceDescriptions[simpleKey] || serviceDescriptions[fullName] || {};
      
      const description = extraInfo 
        ? `${extraInfo}${info.description ? ` - ${info.description}` : ''}`
        : (info.description || service.description || `Professional ${displayName.toLowerCase()} services`);

      return {
        id: service._id,
        name: displayName,
        description: description,
        tags: info.tags || [],
        link: `/providers/${encodeURIComponent(fullName)}`,
      };
    });

    if (mappedServices.length > 6) {
      const result = mappedServices.slice(0, 6);
      result.push({
        id: 'all-services',
        name: 'All Services',
        description: 'Explore our complete range of specialized services',
        tags: ['more', 'explore'],
        link: '/services',
        isAction: true // Special flag for styling if needed
      });
      return result;
    }

    return mappedServices;
  };

  // Fallback menu items (when services fail to load)
  const fallbackMenuItems = [
    {
      title: "Services",
      link: "/services",
      submenu: [
        {
          name: "All Services",
          description: "Browse all available services",
          link: "/services",
        },
      ],
    },
    {
      title: "Boost now",
      link: "/pricing",
      submenu: [],
    },
    {
      title: "Contact Us",
      link: "/contact-us",
      submenu: [],
    },
  ];

  // Menu data with dynamic services or fallback
  const menuItems = loading || error
    ? fallbackMenuItems
    : [
        {
          title: "Services",
          link: "/services",
          submenu: generateDynamicSubmenu(),
        },
        {
          title: "Boost now",
          link: "/pricing",
          submenu: [],
        },
        {
          title: "Contact Us",
          link: "/contact-us",
          submenu: [],
        },
      ];

  const performSearch = async (query) => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    // Check in-memory cache first
    if (!searchCacheRef.current) searchCacheRef.current = {};
    
    if (searchCacheRef.current[q]) {
      return searchCacheRef.current[q];
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const productResults = (data.products || []).map((p) => ({
        name: p.name,
        description: p.brand ? `${p.brand} · ${p.category}` : p.category,
        link: `/product/${p._id}`,
        category: p.category,
        image: p.images?.[0] ? `${API_BASE_URL}/${p.images[0]}` : null,
        price: p.price,
      }));
      // Cache the product results
      searchCacheRef.current[q] = productResults;
      return productResults;
    } catch {
      return [];
    }
  };


  // Show loading skeleton while services are loading
  if (loading && activeServices.length === 0) {
    return (
      <nav
        className="sticky top-0 inset-x-0 z-50"
        role="navigation"
        aria-label="Main Navigation"
      >
        <NavbarSkeleton isScrolled={isScrolled} />
      </nav>
    );
  }


  return (
    <nav
      className={`${isMobile ? 'contents' : `sticky top-0 inset-x-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-lg" : "shadow-md"
      }`}`}
      role="navigation"
      aria-label="Main Navigation"
    >
      <Suspense
        fallback={
          <div
            className={`bg-white ${
              isScrolled ? "h-20 md:h-16 lg:h-18" : "h-22 md:h-18 lg:h-20"
            }`}
            aria-hidden="true"
          />
        }
      >
        {isMobile ? (
          <MobileNavbar
            menuItems={menuItems}
            performSearch={performSearch}
            isScrolled={isScrolled}
          />
        ) : (
          <DesktopNavbar
            menuItems={menuItems}
            performSearch={performSearch}
            isScrolled={isScrolled}
          />
        )}
      </Suspense>
    </nav>
  );
};

export default Navbar;
