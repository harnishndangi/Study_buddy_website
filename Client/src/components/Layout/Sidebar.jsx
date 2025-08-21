import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.png";
import logo1 from "../../assets/icons/logo1.png";
import axios from "../../api/axiosConfig";
import {
  HelpCircle,
  SettingsIcon,
  SunIcon,
  Calendar,
  BarChart2,
  ClipboardList,
  Layers,
  FileText,
  AlarmCheckIcon,
  LogOut,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Notes", to: "/notes", icon: <FileText size={18} /> },
  { label: "Tasks", to: "/tasks", icon: <ClipboardList size={18} /> },
  { label: "Pomodoro", to: "/pomodoro", icon: <AlarmCheckIcon size={18} /> },
  { label: "Calendar", to: "/calendar", icon: <Calendar size={18} /> },
  { label: "Analytics", to: "/analytics", icon: <BarChart2 size={18} /> },
  { label: "Clips", to: "/clips", icon: <Layers size={18} /> },
  { label: "Groups", to: "/groups", icon: <Users size={18} /> },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine login state from presence of user in localStorage
  const computeLoggedIn = () => !!localStorage.getItem("user");

  useEffect(() => {
    setIsLoggedIn(computeLoggedIn());
    const onStorage = (e) => {
      if (e.key === "user") setIsLoggedIn(computeLoggedIn());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Re-evaluate on route changes to reflect login state updates within the tab
  useEffect(() => {
    setMobileOpen(false);
    setIsLoggedIn(computeLoggedIn());
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {
      console.error({ error: "Failed to log out" });
    }
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      {/* Desktop / Tablet Sidebar (unchanged behavior) */}
      <aside className="hidden md:flex fixed left-0 top-0 flex-col h-screen w-40 shadow-xl border-r-2 border-slate-100 bg-white/80 backdrop-blur-lg rounded-xl p-6 transition-all duration-300 z-40 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-center mb-5">
          <Link to="/" className="flex justify-center">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 md:w-30 md:h-15 object-contain"
            />
          </Link>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg font-medium transition-all duration-200 ${location.pathname === item.to
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
            >
              <span className="transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span className="inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-4">
          <div className="flex flex-row justify-start gap-[4px]">
            <button
              className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition relative"
              aria-label="Toggle theme"
              tabIndex={0}
            >
              <SunIcon
                size={18}
                className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform"
              />
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Theme
              </span>
            </button>
            <Link to="/settings" tabIndex={-1}>
              <button
                className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition relative"
                aria-label="Settings"
                tabIndex={0}
              >
                <SettingsIcon
                  size={18}
                  className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform"
                />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Settings
                </span>
              </button>
            </Link>
            <Link to="/help" tabIndex={-1}>
              <button
                className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition relative"
                aria-label="Help"
                tabIndex={0}
              >
                <HelpCircle
                  size={18}
                  className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform"
                />
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Help
                </span>
              </button>
            </Link>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {!isLoggedIn ? (
              <>
                <Link to="/signup" className="w-full">
                  <button
                    aria-label="Sign up"
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition"
                  >
                    Sign Up
                  </button>
                </Link>
                <Link to="/login" className="w-full">
                  <button
                    aria-label="Log in"
                    className="w-full bg-white text-indigo-600 border border-indigo-200 py-2 rounded-lg font-semibold shadow hover:bg-indigo-50 transition"
                  >
                    Login
                  </button>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="group relative w-full bg-red-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <span className="transition-transform group-hover:scale-110">
                  <LogOut size={18} />
                </span>
                <span className="inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Navbar + Drawer */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo1} alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-slate-800">Study Buddy</span>
        </Link>
        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-md border border-slate-200 bg-white shadow-sm active:scale-95"
        >
          {/* Simple hamburger / close icon */}
          <span className="block w-5">
            <span
              className={`block h-[2px] bg-slate-800 transition-transform ${mobileOpen ? "rotate-45 translate-y-[5px]" : ""
                }`}
            ></span>
            <span
              className={`block h-[2px] bg-slate-800 my-[5px] transition-opacity ${mobileOpen ? "opacity-0" : "opacity-100"
                }`}
            ></span>
            <span
              className={`block h-[2px] bg-slate-800 transition-transform ${mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""
                }`}
            ></span>
          </span>
        </button>
      </header>

      {/* Overlay */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-40"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Drawer panel */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-50 max-w-[85vw] bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-slate-200 z-50 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-start gap-2 bg-gradient-to-r from-white to-indigo-50">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo1} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-slate-800">Study Buddy</span>
          </Link>
        </div>

        <div className="flex flex-col h-[calc(100%-56px)]">
          <nav className="px-3 py-3 flex-1 flex flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium border-l-4 transition-colors ${location.pathname === item.to
                  ? "bg-indigo-600 text-white shadow border-indigo-600"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 border-transparent"
                  }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions pinned to bottom on small devices */}
          <div className="px-3 py-4 border-t border-slate-200 flex flex-col gap-3 pb-safe">
            <div className="flex flex-row flex-wrap gap-2">
              <button
                className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                aria-label="Toggle theme"
              >
                <SunIcon
                  size={18}
                  className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform"
                />
              </button>
              <Link to="/settings">
                <button
                  className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  aria-label="Settings"
                >
                  <SettingsIcon
                    size={18}
                    className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform"
                  />
                </button>
              </Link>
              <Link to="/help">
                <button
                  className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  aria-label="Help"
                >
                  <HelpCircle
                    size={18}
                    className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform"
                  />
                </button>
              </Link>
            </div>

            {!isLoggedIn ? (
              <>
                <Link to="/signup" className="w-full">
                  <button
                    aria-label="Sign up"
                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold shadow hover:bg-indigo-700 transition text-sm"
                  >
                    Sign Up
                  </button>
                </Link>
                <Link to="/login" className="w-full">
                  <button
                    aria-label="Log in"
                    className="w-full bg-white text-indigo-600 border border-indigo-200 py-2.5 rounded-lg font-semibold shadow hover:bg-indigo-50 transition text-sm"
                  >
                    Login
                  </button>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold shadow hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
