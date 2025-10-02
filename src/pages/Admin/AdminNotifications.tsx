// src/pages/admin/AdminNotifications.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bell, Star, X } from "lucide-react";

/* ------------ Types ------------- */
type NotificationType =
  | "EnquiryForAdmin"
  | "ListingApprovalRequest"
  | "KycApprovalRequest"
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
    hour12: true, // 12-hour like 9:00 PM
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

/** Color meta (stripe, tag, tint, modal colors) */
const TYPE_META: Record<
  string,
  {
    label: string;
    stripe: string; // left stripe color
    tagText: string;
    tagBorder: string;
    dot: string;
    tint: string; // light bar/tint
    modalBg: string; // modal soft background
  }
> = {
  EnquiryForAdmin: {
    label: "Enquiry from Buyer",
    stripe: "#0ea5e9",
    tagText: "text-sky-700",
    tagBorder: "border-sky-500",
    dot: "#0ea5e9",
    tint: "bg-sky-300",
    modalBg: "bg-sky-50",
  },
  ListingApprovalRequest: {
    label: "Check Listing for Approval",
    stripe: "#b40000ff",
    tagText: "text-red-700",
    tagBorder: "border-red-500",
    dot: "#b40000ff",
    tint: "bg-red-300",
    modalBg: "bg-red-50",
  },
  KycApprovalRequest: {
    label: "Validate KYC Request",
    stripe: "#10b981",
    tagText: "text-emerald-700",
    tagBorder: "border-emerald-500",
    dot: "#10b981",
    tint: "bg-emerald-300",
    modalBg: "bg-emerald-50",
  },
};

const FALLBACK_META = {
  label: "Other",
  stripe: "#f43f5e",
  tagText: "text-rose-700",
  tagBorder: "border-rose-200",
  dot: "#f43f5e",
  tint: "bg-rose-50",
  modalBg: "bg-rose-50",
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
          ? "bg-white border-t-4 border-orange-400 shadow-sm hover:shadow hover:-translate-y-0.5"
          : "bg-gray-100 hover:-translate-y-0.5" // light orange for viewed
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

            {/* stretch tint line */}
            {/* <div className={cx("flex-1 rounded-md h-1.5", meta.tint)} aria-hidden /> */}

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

        {/* Message (2 lines only, inline clamp fallback) */}
        <div
          className={cx(
            "mt-2 text-sm break-words leading-5",
            unread ? "text-gray-900" : "text-gray-800"
          )}
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as any,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
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
    // start enter animation
    const t = setTimeout(() => setVisible(true), 15);
    return () => clearTimeout(t);
  }, []);

  const closeWithAnim = () => {
    // run exit animation
    setVisible(false);
    setTimeout(() => onClose(), 220); // match duration-200 below
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={closeWithAnim}
    >
      {/* Backdrop (fade in/out, no /30 opacity shorthand) */}
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
        onClick={(e) => e.stopPropagation()} // keep clicks inside from closing
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
        <div className="mt-3 text-xs text-gray-600">
          {formatWhen(item.createdAt)}
        </div>
      </div>
    </div>
  );
};

/* ------------ Page ------------- */
const AdminNotifications: React.FC = () => {
  const [all, setAll] = useState<NotificationDetails[]>([]);
  const [newIds, setNewIds] = useState<Set<number>>(new Set()); // last 24h
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

  // pagination (0-based page)
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10); // 5 / 10 / 15

  // modal
  const [openItem, setOpenItem] = useState<NotificationDetails | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const [allResp, newResp] = await Promise.all([
        axios.get<NotificationDetails[]>(`${API_BASE_URL}/admin/allNotifications`),
        axios.get<NotificationDetails[]>(`${API_BASE_URL}/admin/newNotifications`),
      ]);

      const allData = Array.isArray(allResp.data) ? allResp.data : [];
      allData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const newSet = new Set<number>(
        (Array.isArray(newResp.data) ? newResp.data : []).map((n) => n.notificationId)
      );

      setAll(allData);
      setNewIds(newSet);
      setPage(0);
    } catch (e) {
      console.error(e);
      setErr("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // freeze/unfreeze background on modal open
  useEffect(() => {
    if (!openItem) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("wheel", prevent as EventListener, { passive: false });
    document.addEventListener("touchmove", prevent as EventListener, { passive: false });

    return () => {
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevDocOverflow || "";
      document.removeEventListener("wheel", prevent as EventListener);
      document.removeEventListener("touchmove", prevent as EventListener);
    };
  }, [openItem]);

  const unreadLocal = useMemo(
    () => all.reduce((acc, n) => acc + (n.notificationViewed ? 0 : 1), 0),
    [all]
  );

  // ---------- [NEW CODE] ---------- //
  // Watch for when all notifications become read
  useEffect(() => {
    // If there are notifications loaded and the unread count is zero,
    // tell the parent layout to hide the notification dot.
    if (all.length > 0 && unreadLocal === 0) {
      window.dispatchEvent(new Event("admin:markAllRead"));
    }
    // This effect runs whenever the unread count changes.
  }, [unreadLocal, all.length]);
  // -------------------------------- //

  // derived
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
  const numbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  const markViewedLocal = (id: number) => {
    setAll((prev) =>
      prev.map((n) =>
        n.notificationId === id ? { ...n, notificationViewed: true } : n
      )
    );
  };

  const markNotificationViewed = async (id: number) => {
    markViewedLocal(id); // optimistic
    try {
      await axios.patch(`${API_BASE_URL}/admin/markNotificationViewed/${id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    // optimistic
    setAll((prev) => prev.map((n) => ({ ...n, notificationViewed: true })));
    try {
      const resp = await axios.patch<NotificationDetails[]>(
        `${API_BASE_URL}/admin/markAllNotificationViewedForAdmin`
      );
      if (Array.isArray(resp.data)) {
        const sorted = [...resp.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAll(sorted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header (with your requested style updates) */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-[#ffe9df] border border-orange-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-600" /> Notifications
            </h2>

          <div className="flex items-center gap-3">
            <div className="text-sm text-black backdrop-blur px-3 py-1.5 font-medium">
              {loading ? "Loading..." : (
                <>
                  <span className="font-bold">{unreadLocal}</span> Unread •{" "}
                  <span className="font-bold">{total}</span> Total
                </>
              )}
            </div>

            {total > 0 && (
              <button
                onClick={async () => {
                  await markAllAsRead();
                  // tell AdminLayout to hide the dot immediately
                  window.dispatchEvent(new Event("admin:markAllRead"));
                }}
                className="px-3 py-1.5 rounded-full border border-orange-600 border-2 bg-white hover:bg-gray-100 text-sm text-orange-600 font-bold"
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-xl border border-gray-200 animate-pulse"
            />
          ))}
        </div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : total === 0 ? (
        <div className="text-gray-600">No notifications found.</div>
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

          {/* Unified pagination bar (same as listings) */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6f3] px-4 py-3 border border-orange-100">
            <div className="text-sm text-gray-600">
              Page <span className="font-medium">{current}</span> of{" "}
              <span className="font-medium">{totalForBar}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
                className="text-sm text-gray-700 disabled:opacity-50"
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
                      disabled={loading}
                      className={[
                        "mx-1 w-9 h-9 text-sm rounded-full border transition",
                        active
                          ? "bg-buttonOrange text-themeOrange border-themeOrange"
                          : "bg-white hover:bg-gray-50",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, Math.max(0, totalForBar - 1)))
                }
                disabled={current >= totalForBar || loading}
                className="text-sm text-gray-700 disabled:opacity-50"
              >
                Next Page ›
              </button>
            </div>

            {/* Per page selector (5/10/15) */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="border rounded-lg px-2 py-1 text-sm bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Details Modal with pop-in/out animation */}
      {openItem && (
        <AnimatedModal item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </div>
  );
};

export default AdminNotifications;