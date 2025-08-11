import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo  from "../../assets/icons/logo.png";
import logo1 from "../../assets/icons/logo1.png";
import { HelpCircle, SettingsIcon, SunIcon, BookOpen, Calendar, BarChart2, ClipboardList, Layers, FileText, AlarmCheckIcon, LogOut } from 'lucide-react';

const navItems = [
    { label: "Notes", to: "/notes", icon: <FileText size={18} /> },
    { label: "Tasks", to: "/tasks", icon: <ClipboardList size={18} /> },
    { label: "Pomodoro", to: "/pomodoro", icon: <AlarmCheckIcon size={18} /> },
    { label: "Calendar", to: "/calendar", icon: <Calendar size={18} /> },
    { label: "Analytics", to: "/analytics", icon: <BarChart2 size={18} /> },
    { label: "Clips", to: "/clips", icon: <Layers size={18} /> },
];


function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <aside className="fixed left-0 top-0 flex flex-col h-screen w-20 md:w-40 bg-white shadow-2xl md:shadow-xl border-r-2 border-indigo-100 md:border-slate-100 md:bg-white/80 md:backdrop-blur-lg rounded-none md:rounded-xl p-4 md:p-6 transition-all duration-300 z-40 overflow-hidden">
            {/* Logo */}
            <div className=" flex items-center justify-center mb-5">
                <Link to="/" className="flex justify-center">
                    <img
                        src={logo1}
                        alt="Logo1"
                        className="w-12 h-12 object-contain md:hidden"
                    />
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-12 h-12 md:w-30 md:h-15 object-contain hidden md:block"
                    />
                </Link>
            </div>
            <nav className="flex-1 flex flex-col gap-2 ">
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        aria-label={item.label}
                        className={`group relative flex items-center gap-1 px-1.5 py-2 rounded-lg font-medium transition-all duration-200
                          ${location.pathname === item.to
                                ? "bg-indigo-600 text-white shadow"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}
                        `}
                    >
                        <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                        <span className="hidden md:inline">{item.label}</span>
                        {/* Tooltip for small screens */}
                        <span className="md:hidden absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {item.label}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-4">
                <div className="flex flex-col gap-4 justify-center items-center md:flex-row md:justify-start md:gap-[4px]">
                    <button
                        className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition relative"
                        aria-label="Toggle theme"
                        tabIndex={0}
                    >
                        <SunIcon size={18} className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100  transition-opacity whitespace-nowrap z-10">Theme</span>
                    </button>
                    <Link to="/settings" tabIndex={-1}>
                        <button
                            className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition relative"
                            aria-label="Settings"
                            tabIndex={0}
                        >
                            <SettingsIcon size={18} className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100  transition-opacity whitespace-nowrap z-10">Settings</span>
                        </button>
                    </Link>
                    <Link to="/help" tabIndex={-1}>
                        <button
                            className="group p-2 rounded-xl bg-white/70 border border-slate-200 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition relative"
                            aria-label="Help"
                            tabIndex={0}
                        >
                            <HelpCircle size={18} className="text-slate-500 group-hover:text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100  transition-opacity whitespace-nowrap z-10">Help</span>
                        </button>
                    </Link>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    {!isLoggedIn ? (
                        <>
                            <Link to="/signup" className="w-full">
                                <button aria-label="Sign up" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition">
                                    Sign Up
                                </button>
                            </Link>
                            <Link to="/login" className="w-full">
                                <button aria-label="Log in" className="w-full bg-white text-indigo-600 border border-indigo-200 py-2 rounded-lg font-semibold shadow hover:bg-indigo-50 transition">
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
                            <span className="transition-transform group-hover:scale-110"><LogOut size={18} /></span>
                            <span className="hidden md:inline">Logout</span>
                            <span className="md:hidden absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">Logout</span>
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;