// src/components/BuyerSidebar.tsx
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, type Location } from "react-router-dom";
import logo from "../images/logo.png";
import {
  LayoutDashboard,
  Building2,
  Users,
  Bell,
  LogOut,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

// --- Reusable Flyout/Accordion Item Component ---
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
    if (!collapsed) {
      setIsOpen(isSectionActive);
    }
  }, [isSectionActive, collapsed]);

  useEffect(() => {
    setIsOpen(false);
  }, [collapsed]);
  
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if (
        anchorRef.current && !anchorRef.current.contains(targetNode) &&
        flyoutContentRef.current && !flyoutContentRef.current.contains(targetNode)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen && collapsed) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, collapsed]);
  
  const handleButtonClick = () => {
    if (collapsed && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
    setIsOpen((v) => !v);
  };

  const parentBtnClass = [
    "flex items-center gap-3 px-3 py-2 rounded-lg my-1 text-sm w-full transition",
    isOpen && !collapsed
      ? "bg-gray-100 text-black"
      : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

  return (
    <div className="relative">
      <button
        ref={anchorRef}
        onClick={handleButtonClick}
        className={parentBtnClass}
        title={label}
      >
        <div className="flex items-center justify-center w-6 h-6">{icon}</div>
        {!collapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap">
            <span>{label}</span>
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-90" : ""
              }`}
              aria-hidden
            />
          </div>
        )}
      </button>

      {isOpen && collapsed && position && createPortal(
        <div
          ref={flyoutContentRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
          }}
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


// --- Main BuyerSidebar Component ---
type SidebarProps = { collapsed?: boolean };

const BuyerSidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();

  const navItemClass = (isActive: boolean) =>
    [
      "group flex items-center gap-3 px-3 py-2 rounded-lg my-1 text-sm transition",
      isActive
        ? "bg-themeOrange text-white shadow-sm"
        : "text-gray-700 hover:bg-gray-100",
    ].join(" ");

  const subItemClass = (isActive: boolean) =>
    [
      "px-3 py-1.5 rounded-md text-xs transition text-left w-full",
      isActive
        ? "bg-themeOrange text-white"
        : "text-gray-700 hover:bg-gray-100",
    ].join(" ");

  return (
    <aside
      className={`bg-white border-r border-gray-200 ${
        collapsed ? "w-16" : "w-56"
      } h-screen sticky top-0 left-0 transition-[width] duration-200`}
      aria-label="Buyer sidebar"
    >
      <div className="h-full flex flex-col">
        {/* Brand */}
        <div className="flex items-center justify-center px-2 py-2 border-b">
          <img
            src={logo}
            alt="PropAdda"
            title="PropAdda"
            className={`object-contain transition-all duration-200 ${
              collapsed ? "w-18 h-16" : "w-20 h-16"
            }`}
          />
          {/* {!collapsed && (
            <div className="ml-2">
              <div className="font-semibold leading-5">PropAdda</div>
              <div className="text-xs text-gray-500">Buyer Panel</div>
            </div>
          )} */}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3">
          {/* Dashboard */}
          <NavLink to="/Buyer" className={({ isActive }) => navItemClass(isActive)} end title="Dashboard"> {/* <-- title added */}
            <div className="flex items-center justify-center w-6 h-6">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">Dashboard</div>}
          </NavLink>

          {/* Listings */}
          <FlyoutNavItem
            collapsed={collapsed}
            label="Listings"
            icon={<Building2 className="w-5 h-5" />}
            isSectionActive={location.pathname.startsWith("/admin/listings")}
            location={location}
          >
            <NavLink to="/admin/listings/active" className={({ isActive }) => subItemClass(isActive)}>Active Listings</NavLink>
            <NavLink to="/admin/listings/pending" className={({ isActive }) => subItemClass(isActive)}>Pending Approval</NavLink>
            <NavLink to="/admin/listings/expired" className={({ isActive }) => subItemClass(isActive)}>Expired</NavLink>
            <NavLink to="/admin/listings/sold" className={({ isActive }) => subItemClass(isActive)}>Sold</NavLink>
            <NavLink to="/admin/listings/vip" className={({ isActive }) => subItemClass(isActive)}>Featured / VIP</NavLink>
          </FlyoutNavItem>

          {/* Leads */}
          <FlyoutNavItem
            collapsed={collapsed}
            label="Leads"
            icon={<ClipboardList className="w-5 h-5" />}
            isSectionActive={location.pathname.startsWith("/admin/leads")}
            location={location}
          >
            <NavLink to="/admin/leads/all" className={({ isActive }) => subItemClass(isActive)}>All Leads</NavLink>
            <NavLink to="/admin/leads/assigned" className={({ isActive }) => subItemClass(isActive)}>Assigned Leads</NavLink>
            <NavLink to="/admin/leads/shoots" className={({ isActive }) => subItemClass(isActive)}>Shoot Requests</NavLink>
          </FlyoutNavItem>


          {/* Users */}
          <FlyoutNavItem
            collapsed={collapsed}
            label="Users"
            icon={<Users className="w-5 h-5" />}
            isSectionActive={location.pathname.startsWith("/admin/users")}
            location={location}
          >
            <NavLink to="/admin/users/propertySeekers" className={({ isActive }) => subItemClass(isActive)}>Property Seekers</NavLink>
            <NavLink to="/admin/users/BuyersBrokersBuilders" className={({ isActive }) => subItemClass(isActive)}>Buyers / Brokers / Builders</NavLink>
            <NavLink to="/admin/users/KYC" className={({ isActive }) => subItemClass(isActive)}>KYC Requests</NavLink>
          </FlyoutNavItem>

          {/* Notifications */}
          <NavLink to="/admin/notifications" className={({ isActive }) => navItemClass(isActive)} title="Notifications"> {/* <-- title added */}
            <div className="flex items-center justify-center w-6 h-6">
              <Bell className="w-5 h-5" />
            </div>
            {!collapsed && <div className="flex-1">Notifications</div>}
          </NavLink>

          {/* Logout */}
          <NavLink to="/logout" className={({ isActive }) => navItemClass(isActive)} title="Logout"> {/* <-- title added */}
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

export default BuyerSidebar;