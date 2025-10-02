import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, type Location } from "react-router-dom";
import logo from "../images/logo.png";
import {
  LayoutDashboard,
  Building2,
  Bell,
  IdCard,
  LifeBuoy,
  ChevronRight,
  LogOut,
  HousePlus,
} from "lucide-react";

/* ---------------- Reusable Flyout/Accordion Item ---------------- */
type FlyoutNavItemProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  label: string;
  isSectionActive: boolean;
  collapsed: boolean;
  location: Location;
};

const FlyoutNavItem: React.FC<FlyoutNavItemProps> = ({
  children,
  icon,
  label,
  isSectionActive,
  collapsed,
  location,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const flyoutContentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!collapsed) setIsOpen(isSectionActive);
  }, [isSectionActive, collapsed]);

  useEffect(() => setIsOpen(false), [collapsed]);
  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        anchorRef.current &&
        !anchorRef.current.contains(target) &&
        flyoutContentRef.current &&
        !flyoutContentRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen && collapsed) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, collapsed]);

  const handleButtonClick = () => {
    if (collapsed && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.top, left: rect.right + 8 });
    }
    setIsOpen((v) => !v);
  };

  const parentBtnClass = [
    "flex items-center gap-3 px-3 py-2 rounded-lg my-1 text-sm w-full transition",
    isOpen && !collapsed ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

  return (
    <div className="relative">
      <button ref={anchorRef} onClick={handleButtonClick} className={parentBtnClass} title={label}>
        <div className="flex items-center justify-center w-6 h-6">{icon}</div>
        {!collapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap">
            <span>{label}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
          </div>
        )}
      </button>

      {isOpen && collapsed && position &&
        createPortal(
          <div
            ref={flyoutContentRef}
            style={{ position: "fixed", top: position.top, left: position.left }}
            className="w-48 bg-white border rounded-lg shadow-xl z-50 animate-in fade-in-5 slide-in-from-left-2 duration-150"
          >
            <div className="font-bold text-sm p-2 border-b">{label}</div>
            <div className="flex flex-col p-1">{children}</div>
          </div>,
          document.body
        )}

      {isOpen && !collapsed && (
        <div className="ml-8 mb-2 flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
          {children}
        </div>
      )}
    </div>
  );
};

/* ---------------- Main AgentSidebar ---------------- */
type SidebarProps = { collapsed?: boolean; className?: string; };

const AgentSidebar: React.FC<SidebarProps> = ({ collapsed = false, className = '' }) => {
  const location = useLocation();

  const navItemClass = (isActive: boolean) =>
    [
      "group flex items-center gap-3 px-3 py-2 rounded-lg my-1 text-sm transition",
      isActive ? "bg-themeOrange text-white shadow-sm" : "text-gray-700 hover:bg-gray-100",
    ].join(" ");

  const subItemClass = (isActive: boolean) =>
    [
      "px-3 py-1.5 rounded-md text-xs transition text-left w-full",
      isActive ? "bg-themeOrange text-white" : "text-gray-700 hover:bg-gray-100",
    ].join(" ");

  return (
    <aside
      className={`bg-white border-r border-gray-200 ${
        collapsed ? "w-16" : "w-56"
      } h-screen fixed top-0 left-0 transition-[width] duration-200 ${className}`}
      aria-label="Agent sidebar"
    >
      <div className="h-full flex flex-col">
        {/* Brand */}
        <div className="flex items-center justify-center px-2 py-2 border-b">
          <img
            src={logo}
            alt="PropAdda"
            title="PropAdda"
            className={`object-contain transition-all duration-200 ${collapsed ? "w-18 h-16" : "w-20 h-16"}`}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3">
          {/* Dashboard */}
          <NavLink to="/agent" end className={({ isActive }) => navItemClass(isActive)} title="Dashboard">
            <div className="flex items-center justify-center w-6 h-6">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">Dashboard</div>}
          </NavLink>

          {/* Listings (headings → subheadings) */}
          <FlyoutNavItem
            collapsed={collapsed}
            label="Listings"
            icon={<Building2 className="w-5 h-5" />}
            isSectionActive={location.pathname.startsWith("/agent/listings")}
            location={location}
          >
            <NavLink to="/agent/listings/active" className={({ isActive }) => subItemClass(isActive)}>
              Active
            </NavLink>
            <NavLink to="/agent/listings/pending" className={({ isActive }) => subItemClass(isActive)}>
              Pending
            </NavLink>
            <NavLink to="/agent/listings/expired" className={({ isActive }) => subItemClass(isActive)}>
              Expired
            </NavLink>
            <NavLink to="/agent/listings/sold" className={({ isActive }) => subItemClass(isActive)}>
              Sold
            </NavLink>
          </FlyoutNavItem>

          {/* KYC (single) */}
          <NavLink to="/agent/kycStatus" className={({ isActive }) => navItemClass(isActive)} title="KYC Status">
            <div className="flex items-center justify-center w-6 h-6">
              <IdCard className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">KYC Status</div>}
          </NavLink>

          {/* Notifications (single) */}
          <NavLink to="/agent/notifications" className={({ isActive }) => navItemClass(isActive)} title="Notifications">
            <div className="flex items-center justify-center w-6 h-6">
              <Bell className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">Notifications</div>}
          </NavLink>

          {/* Support (headings → subheadings) */}
          <FlyoutNavItem
            collapsed={collapsed}
            label="Support"
            icon={<LifeBuoy className="w-5 h-5" />}
            isSectionActive={location.pathname.startsWith("/agent/support")}
            location={location}
          >
            <NavLink to="/agent/support/feedback" className={({ isActive }) => subItemClass(isActive)}>
              Feedback
            </NavLink>
            <NavLink to="/agent/support/help" className={({ isActive }) => subItemClass(isActive)}>
              Help
            </NavLink>
            <NavLink to="/agent/support/manageProfile" className={({ isActive }) => subItemClass(isActive)}>
              Manage Profile
            </NavLink>
          </FlyoutNavItem>

          {/* Optional: Post a Property (top-level quick action) */}
          <NavLink to="/agent/postproperty" className={({ isActive }) => navItemClass(isActive)} title="Post a Property">
            <div className="flex items-center justify-center w-6 h-6">
              <HousePlus className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">Post a Property</div>}
          </NavLink>

          {/* Optional: Account/Password (if you prefer outside Support) */}
          {/* <NavLink to="/agent/support/manageProfile?tab=password" className={({ isActive }) => navItemClass(isActive)} title="Change Password">
            <div className="flex items-center justify-center w-6 h-6">
              <UserCog className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">Change Password</div>}
          </NavLink> */}

          {/* Logout */}
          <NavLink to="/logout" className={({ isActive }) => navItemClass(isActive)} title="Logout">
            <div className="flex items-center justify-center w-6 h-6">
              <LogOut className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">Logout</div>}
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t">
          {!collapsed && (
            <div className="text-xs text-gray-500">
              Copyright © {new Date().getFullYear()} PropAdda
              <div className="text-xs text-gray-400">Powered by Studio by ReLabel</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AgentSidebar;
