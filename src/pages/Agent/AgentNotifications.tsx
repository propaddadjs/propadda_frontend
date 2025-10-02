import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Star, X, Bell, AlertCircle } from "lucide-react";

// --- Configuration ---
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

const AGENT_ID = 2; // Replace with dynamic Agent ID later
const PAGE_SIZE_OPTIONS = [5, 8, 10, 15]; 

/* ------------ Types ------------- */
type NotificationType =
  | "ListingApproval"
  | "ListingRejection"
  | "KycApproved"
  | "KycRejected"
  | "ExpiredListing"
  | "RenewedListing"
  | "ExpiryReminder"
  | string;

type NotificationDetails = {
  notificationId: number;
  notificationType: NotificationType;
  notificationMessage: string;
  notificationSenderId: number;
  notificationReceiverId: number;
  notificationSenderRole: string;
  notificationReceiverRole: string;
  notificationViewed: boolean;
  createdAt: string; // ISO
};

/* ------------ Helpers ------------- */
const cx = (...cls: (string | false | undefined | null)[]) =>
  cls.filter(Boolean).join(" ");

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);

  const time = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (same(d, now)) return `Today ${time}`;
  if (same(d, yest)) return `Yesterday ${time}`;
  const date = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return `${date} ${time}`;
}

/** Color meta for Agent notification types (BASED ON ENUM) */
const TYPE_META: Record<
  string,
  {
    label: string;
    stripe: string;
    tagText: string;
    tagBorder: string;
    dot: string;
    modalBg: string;
  }
> = {
  // --- SUCCESS/CONFIRMATION (Green/Blue) ---
  ListingApproval: {
    label: "Listing Approved",
    stripe: "#10b981", // Emerald/Green
    tagText: "text-emerald-700",
    tagBorder: "border-emerald-500",
    dot: "#10b981",
    modalBg: "bg-emerald-50",
  },
  KycApproved: {
    label: "KYC Approved",
    stripe: "#059669", // Darker Green
    tagText: "text-emerald-700",
    tagBorder: "border-emerald-500",
    dot: "#059669",
    modalBg: "bg-emerald-50",
  },
  RenewedListing: {
    label: "Listing Renewed",
    stripe: "#3b82f6", // Blue
    tagText: "text-blue-700",
    tagBorder: "border-blue-500",
    dot: "#3b82f6",
    modalBg: "bg-blue-50",
  },
  
  // --- FAILURE/REJECTION/CRITICAL ACTION (Red) ---
  ListingRejection: {
    label: "Listing Rejected",
    stripe: "#dc2626", // Red
    tagText: "text-red-700",
    tagBorder: "border-red-500",
    dot: "#dc2626",
    modalBg: "bg-red-50",
  },
  KycRejected: {
    label: "KYC Rejected",
    stripe: "#b91c1c", // Darker Red
    tagText: "text-red-700",
    tagBorder: "border-red-500",
    dot: "#b91c1c",
    modalBg: "bg-red-50",
  },

  // --- WARNING/REMINDER/EXPIRED (Orange/Yellow) ---
  ExpiryReminder: {
    label: "Expiry Reminder",
    stripe: "#f59e0b", // Amber/Yellow
    tagText: "text-amber-700",
    tagBorder: "border-amber-500",
    dot: "#f59e0b",
    modalBg: "bg-amber-50",
  },
  ExpiredListing: {
  label: "General Update",
  stripe: "#a855f7", // Violet
  tagText: "text-violet-700",
  tagBorder: "border-violet-300",
  dot: "#a855f7",
  modalBg: "bg-violet-50",
  },
};

const FALLBACK_META = {
    label: "Listing Expired",
    stripe: "#ea580c", // Orange-red/Dark Orange
    tagText: "text-orange-700",
    tagBorder: "border-orange-500",
    dot: "#ea580c",
    modalBg: "bg-orange-50",
};

const getMeta = (t: NotificationType) => TYPE_META[t] ?? FALLBACK_META;

/* ------------ Row ------------- */
const Row: React.FC<{
  n: NotificationDetails;
  isNew: boolean;
  onOpen: (n: NotificationDetails) => void;
  onMarkViewed: (id: number) => void;
}> = ({ n, isNew, onOpen, onMarkViewed }) => {
  const unread = !n.notificationViewed;
  const meta = getMeta(n.notificationType);

  return (
    <div
      onClick={() => {
        onMarkViewed(n.notificationId);
        onOpen(n);
      }}
      className={cx(
        "relative rounded-xl border transition-all cursor-pointer overflow-hidden flex items-stretch",
        unread
          ? "bg-white border-t-4 border-orange-500 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          : "bg-gray-100 border-gray-200 hover:shadow-sm hover:-translate-y-0.5"
      )}
      role="button"
      aria-label="Open notification"
    >
      {/* Left color stripe */}
      <div
        className="w-1.5 shrink-0"
        style={{ backgroundColor: meta.stripe }}
        aria-hidden
      />

      {/* Content */}
      <div className="flex-1 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          {/* tiny type tag + subtle NEW */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={cx(
                "inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                meta.tagBorder,
                meta.tagText, meta.modalBg
              )}
              title={n.notificationType}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: meta.dot }}
              />
              {meta.label}
            </span>

            {isNew && (
              <span
                className={cx(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-[1px] rounded-full",
                  "border border-yellow-500 text-yellow-700 bg-yellow-50 animate-pulse"
                )}
                title="New"
              >
                <Star className="w-3 h-3" />
                New
              </span>
            )}
          </div>

          {/* time on right */}
          <div className="shrink-0 text-right">
            <div className="text-xs text-gray-600 leading-5">
              {formatWhen(n.createdAt)}
            </div>
          </div>
        </div>

        {/* Message (2 lines only) */}
        <div
          className={cx(
            "mt-2 text-sm break-words leading-5 line-clamp-2", 
            unread ? "text-gray-900 font-medium" : "text-gray-700"
          )}
        >
          {n.notificationMessage}
        </div>
      </div>
    </div>
  );
};

/* ------------ Animated Modal (pop-in/out) ------------- */
const AnimatedModal: React.FC<{
  item: NotificationDetails;
  onClose: () => void;
}> = ({ item, onClose }) => {
  const meta = getMeta(item.notificationType);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 15);
    return () => clearTimeout(t);
  }, []);

  const closeWithAnim = () => {
    setVisible(false);
    setTimeout(() => onClose(), 220); 
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={closeWithAnim}
    >
      {/* Backdrop */}
      <div
        className={cx(
          "absolute inset-0 bg-black transition-opacity duration-200 ease-out",
          visible ? "opacity-40" : "opacity-0"
        )}
      />

      {/* Modal box */}
      <div
        className={cx(
          "relative z-10 w-full max-w-lg rounded-xl shadow-lg border p-5",
          "transform transition-all duration-200 ease-out",
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2",
          meta.modalBg
        )}
        style={{ borderColor: meta.stripe }}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Close button on top-right */}
        <button
          className="absolute top-3 right-3 p-1 rounded hover:bg-white/60"
          onClick={closeWithAnim}
          aria-label="Close"
          title="Close"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Header tag */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={cx(
              "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-white/70",
              meta.tagBorder,
              meta.tagText
            )}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: meta.dot }}
            />
            {meta.label}
          </span>
        </div>

        {/* Message */}
        <div className="text-sm text-gray-900 whitespace-pre-wrap leading-6">
          {item.notificationMessage}
        </div>

        {/* Time (down) */}
        <div className="mt-3 text-xs text-gray-600 border-t pt-2">
          {formatWhen(item.createdAt)}
        </div>
      </div>
    </div>
  );
};

/* ------------ Page ------------- */
const AgentNotifications: React.FC = () => {
  const [all, setAll] = useState<NotificationDetails[]>([]);
  const [newIds, setNewIds] = useState<Set<number>>(new Set()); 
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  // pagination 
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(8); // Default size set to 8
  
  // modal
  const [openItem, setOpenItem] = useState<NotificationDetails | null>(null);


  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // Fetch all notifications and unread count concurrently
      const [allResp, countResp] = await Promise.all([
        axios.get<NotificationDetails[]>(`${API_BASE_URL}/agent/allNotificationsForAgent/${AGENT_ID}`),
        axios.get<number>(`${API_BASE_URL}/agent/getUnreadNotificationCountForAgent/${AGENT_ID}`),
      ]);

      const allData = Array.isArray(allResp.data) ? allResp.data : [];
      // Sort: newest first
      allData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Determine which are 'new' (last 24 hours). 
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const newSet = new Set<number>(
          allData.filter(n => new Date(n.createdAt).getTime() > twentyFourHoursAgo).map(n => n.notificationId)
      );

      setAll(allData);
      setUnreadCount(countResp.data);
      setNewIds(newSet);
      setPage(0);
    } catch (e) {
      console.error(e);
      setErr("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // freeze/unfreeze background on modal open
  useEffect(() => {
    if (!openItem) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevDocOverflow || "";
    };
  }, [openItem]);


  const markNotificationViewed = async (id: number) => {
    // 1. Optimistic UI update
    setAll((prev) =>
      prev.map((n) =>
        n.notificationId === id ? { ...n, notificationViewed: true } : n
      )
    );
    // 2. Decrement unread count locally
    setUnreadCount(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    
    // 3. API call
    try {
      // NOTE: Using the correct endpoint structure: agentId then notificationId
      await axios.patch(`${API_BASE_URL}/agent/markNotificationViewedForAgent/${AGENT_ID}/${id}`);
    } catch (e) {
      console.error("Failed to mark viewed:", e);
      // Optional: Re-fetch or revert optimistic change on failure
    }
  };

  const markAllAsRead = async () => {
    // 1. Optimistic UI update
    setAll((prev) => prev.map((n) => ({ ...n, notificationViewed: true })));
    setUnreadCount(0);

    // 2. API call
    try {
      await axios.patch(
        `${API_BASE_URL}/agent/markAllNotificationViewedForAgent/${AGENT_ID}`
      );
    } catch (e) {
      console.error("Failed to mark all viewed:", e);
    }
  };
  
  // derived pagination data
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageSlice = useMemo(() => {
    const start = page * size;
    return all.slice(start, start + size);
  }, [all, page, size]);

  // numbers bar (same as listings)
  const current = page + 1; // 1-based current
  const totalForBar = totalPages;
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalForBar);
  const numbers = useMemo(
    () => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd, totalForBar]
  );
  
  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); 
  };


  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-[#ffe9df] border border-orange-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-600" /> Notifications
          </h2>

          <div className="flex items-center gap-3">
            {/* UPDATED STYLE FOR COUNT DISPLAY */}
            <div className="text-sm text-black px-3 py-1.5 font-medium"> 
              {loading ? "Loading..." : (
                <>
                  <span className="font-bold">{unreadCount ?? total}</span> Unread •{" "}
                  <span className="font-bold">{total}</span> Total
                </>
              )}
            </div>

            {total > 0 && unreadCount && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 rounded-full border border-orange-600 border-2 bg-white hover:bg-orange-50 text-sm text-orange-600 font-bold transition"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-xl border border-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : err ? (
        <div className="p-4 rounded-lg border border-red-300 bg-red-100 text-red-800">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {err}
        </div>
      ) : total === 0 ? (
        <div className="text-gray-600 p-8 text-center bg-white rounded-xl shadow">
            No notifications found. You're all caught up!
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageSlice.map((n) => (
              <Row
                key={n.notificationId}
                n={n}
                isNew={newIds.has(n.notificationId)}
                onOpen={setOpenItem}
                onMarkViewed={markNotificationViewed}
              />
            ))}
          </div>

          {/* Unified pagination bar */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-orange-50 px-4 py-3 border border-orange-100">
              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{current}</span> of{" "}
                <span className="font-medium">{totalForBar}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-sm text-gray-700 disabled:opacity-50 hover:text-orange-500 transition"
                >
                  ‹ Previous Page
                </button>

                <div className="flex items-center">
                  {numbers.map((n) => {
                    const active = n === current;
                    return (
                      <button
                        key={n}
                        onClick={() => setPage(n - 1)}
                        className={[
                          "mx-1 w-9 h-9 text-sm rounded-full border transition",
                          active
                            ? "bg-orange-500 text-white border-orange-500 font-semibold"
                            : "bg-white hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalForBar - 1))}
                  disabled={current >= totalForBar}
                  className="text-sm text-gray-700 disabled:opacity-50 hover:text-orange-500 transition"
                >
                  Next Page ›
                </button>
              </div>

              {/* Per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Per page:</span>
                <select
                  value={size}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border rounded-lg px-2 py-1 text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                >
                  {PAGE_SIZE_OPTIONS.map(opt => (
                     <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal with pop-in/out animation */}
      {openItem && (
        <AnimatedModal item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
};

export default AgentNotifications;