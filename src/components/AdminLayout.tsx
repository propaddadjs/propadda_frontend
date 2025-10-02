// src/components/AdminLayout.tsx
import React, { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { Menu, Bell, ChevronDown, ChevronsRight } from "lucide-react"; // <-- [NEW] Added ChevronsRight
import axios from "axios";

// --- [NEW] Breadcrumbs Component ---
// This component reads the URL and generates the navigation trail
const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  // Create an array of path segments from the URL (e.g., ['admin', 'listings', 'all'])
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If we are on the main dashboard page, show the original title
  if (pathnames.length <= 1) {
    return <div className="text-lg font-semibold tracking-tight">Admin Dashboard</div>;
  }

  return (
    <div className="flex items-center text-sm">
      <Link to="/admin" className="text-gray-500 hover:text-gray-800">Home</Link>
      {/* We map over the segments, skipping the first one ('admin') */}
      {pathnames.slice(1).map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 2).join('/')}`;
        const isLast = index === pathnames.length - 2;
        // Capitalize the first letter for a clean display
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <React.Fragment key={name}>
            <ChevronsRight className="w-4 h-4 text-gray-400 mx-1" />
            {isLast ? (
              // The last item in the trail is not a link
              <span className="font-semibold text-gray-800">{displayName}</span>
            ) : (
              <Link to={routeTo} className="text-gray-500 hover:text-gray-800">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);
  const navigate = useNavigate();
  //const location = useLocation();
  const mainContentMargin = sidebarCollapsed ? 'ml-16' : 'ml-56';

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

  const fetchUnreadCount = async () => {
    try {
      const resp = await axios.get<number>(`${API_BASE_URL}/admin/getNotificationCount`);
      setHasUnread((resp.data ?? 0) > 0);
    } catch (e) {
      console.error("Failed to fetch notification count", e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => setHasUnread(false);
    window.addEventListener("admin:markAllRead", handler);
    return () => window.removeEventListener("admin:markAllRead", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar collapsed={sidebarCollapsed} className="fixed top-0 left-0 h-full z-40" />

      {/* Main */}
      <div className={`flex-1 flex flex-col ${mainContentMargin}`}>
        {/* Top bar */}
        <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-lg bg-orange-500 transition hover:scale-[1.08]"
              title="Menu"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>

            {/* --- [NEW] The static title is replaced with the dynamic Breadcrumbs component --- */}
            <Breadcrumbs />

          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              title="Notifications"
              className="relative p-2 rounded-lg bg-orange-100 transition hover:scale-[1.08] hover:border-orange-500 border-2"
              onClick={() => navigate("/admin/notifications")}
            >
              <Bell className="w-5 h-5 text-black" />
              {hasUnread && (
                <span
                  className="
                    pointer-events-none select-none
                    absolute bottom-1 right-1
                    w-2 h-2 rounded-full bg-themeOrange"
                />
              )}
            </button>

            {/* Profile section with dropdown */}
            <div ref={profileRef} className="relative">
              <button
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setProfileOpen(prev => !prev)}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium leading-4">Admin</div>
                  <div className="text-xs text-gray-500 leading-4">propaddadjs@gmail.com</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-themeOrange text-white flex items-center justify-center font-bold shadow-sm">
                  A
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl z-40 animate-in fade-in-0 zoom-in-95">
                  <div className="p-1">
                    <Link onClick={() => setProfileOpen(false)} to="/" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Homepage</Link>
                    <Link onClick={() => setProfileOpen(false)} to="/buyer" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Buyer Dashboard</Link>
                    <Link onClick={() => setProfileOpen(false)} to="/agent" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Agent Dashboard</Link>
                    <Link onClick={() => setProfileOpen(false)} to="/admin" className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded">Admin Dashboard</Link>
                    <div className="h-px bg-gray-200 my-1"></div>
                    <Link onClick={() => setProfileOpen(false)} to="/logout" className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded">Logout</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;