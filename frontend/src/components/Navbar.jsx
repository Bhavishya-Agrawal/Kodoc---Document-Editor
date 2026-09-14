import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const links = [];

  return (
    <nav className="w-full px-6 md:px-10 py-4 flex items-center justify-between bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 font-bold text-lg text-gray-900">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <div className="w-2 h-2 rounded-full bg-gray-800" />
          <div className="w-2 h-2 rounded-full bg-gray-800" />
          <div className="w-2 h-2 rounded-full bg-gray-800" />
        </div>
        Kodoc
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((l) => (
          <a
            key={l}
            href="#"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {l}
          </a>
        ))}
      </div>

      {/* Right actions */}
      <div className="hidden md:flex items-center gap-3">
        {isAuthenticated ? (
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5"
          >
            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span>{user?.username || 'User'}</span>
          </button>
        ) : (
          <>
            <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">
              <Link to={"/signin"}>Sign in</Link>
            </button>
            <button className="text-sm font-medium border border-gray-300 rounded-lg px-4 py-1.5 hover:bg-gray-50 transition-colors text-gray-800">
              <Link to={"/signup"}>Sign up</Link>
            </button>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-gray-600"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {menuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg md:hidden px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l} href="#" className="text-sm text-gray-700">
              {l}
            </a>
          ))}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span>{user?.username || 'User'}</span>
              </button>
            ) : (
              <>
                <button className="text-sm text-gray-600">
                  <Link to={"/signin"} onClick={() => setMenuOpen(false)}>Sign in</Link>
                </button>
                <button className="text-sm font-medium border border-gray-300 rounded-lg px-4 py-1.5">
                  <Link to={"/signup"} onClick={() => setMenuOpen(false)}>Sign up</Link>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;