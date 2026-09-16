import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const MegaMenu = ({
  hoverItem,
  menuItems,
  handleMouseLeave,
  timeoutRef,
  onOptionClick,
}) => {
  return (
    <div className="hidden md:block">
      <div
        className="absolute left-0 right-0 w-full bg-white shadow-xl rounded-b-lg transition-all duration-400 ease-in-out overflow-y-auto z-50 border-t border-red-100"
        style={{
          maxHeight:
            hoverItem !== null && menuItems[hoverItem]?.submenu?.length > 0
              ? "550px"
              : "0",
          opacity:
            hoverItem !== null && menuItems[hoverItem]?.submenu?.length > 0
              ? 1
              : 0,
          transition:
            "max-height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseEnter={() => {
          if (timeoutRef && timeoutRef.current)
            clearTimeout(timeoutRef.current);
        }}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-8 py-8">
          {hoverItem !== null && menuItems[hoverItem]?.submenu?.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200 font-sans">
                Top {menuItems[hoverItem].title}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                {menuItems[hoverItem].submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.link || "#"}
                    onClick={onOptionClick}
                    className="group flex flex-col p-4 rounded-xl hover:bg-rose-50 transition-colors duration-300 border border-transparent hover:border-red-100"
                  >
                    <div className="mb-2">
                      <div className="font-medium text-gray-800 group-hover:text-rose-700 transition-colors duration-300">
                        {subItem.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 group-hover:text-gray-700">
                      {subItem.description}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t border-gray-200">
                <Link
                  to={'/'}
                  onClick={onOptionClick}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors duration-300"
                >
                  Browse more {menuItems[hoverItem].title.toLowerCase()}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
