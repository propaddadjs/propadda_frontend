// KycRequests.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Phone, Mail, MapPin, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* -------- Types -------- */
type SellerResponse = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state?: string;
  city?: string;
  role: string;
  profileImageUrl?: string;
  aadharUrl?: string;
  kycVerified?: string;
};

/* -------- Helpers -------- */
const cx = (...cls: (string | false | undefined | null)[]) =>
  cls.filter(Boolean).join(" ");

const initials = (f?: string, l?: string) =>
  ((f?.[0] || "") + (l?.[0] || "")).toUpperCase();

const btn = (...cls: (string | false | undefined | null)[]) =>
  "inline-flex items-center justify-center gap-2 rounded-lg border text-sm transition " +
  (cls.filter(Boolean).join(" ") || "");

/* -------- Card -------- */
const KycCard: React.FC<{
  s: SellerResponse;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}> = ({ s, onApprove, onReject }) => {
  const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Unnamed";
  // const phoneHref = s.phoneNumber ? `tel:+91${s.phoneNumber}` : undefined;
  // const mailHref = s.email ? `mailto:${s.email}` : undefined;
  const location = [s.city, s.state].filter(Boolean).join(", ");

  // role -> badge styling
  const roleBadge = (role?: string) => {
    const r = (role || "").toLowerCase();
    if (r === "seller")
      return "bg-yellow-100 text-themeOrange border border-yellow-300";
    if (r === "buyer")
      return "bg-green-100 text-green-700 border border-green-200";
    if (r === "admin")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-gray-50 text-gray-600 border border-gray-200";
  };

  const prettyRole = (role?: string) => {
    const r = (role || "").toLowerCase();
    if (r === "seller") return "PropAdda Seller";
    if (r === "buyer") return "PropAdda Buyer";
    if (r === "admin") return "PropAdda Admin";
    return "PropAdda User";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-themeOrange/80 via-orange-400 to-blue-300" />

      <div className="p-5">
        <div className="flex items-stretch gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {s.profileImageUrl ? (
              <img
                src={s.profileImageUrl}
                alt={name}
                className="w-40 h-40 rounded-xl object-cover border border-orange-200 shadow-sm"
              />
            ) : (
              <div className="w-40 h-40 rounded-xl bg-orange-50 text-7xl text-orange-500 flex items-center justify-center font-semibold border border-orange-200 shadow-sm">
                {initials(s.firstName, s.lastName) || "U"}
              </div>
            )}
          </div>

          {/* Middle info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">{name}</h3>
                {/* <div className="mt-1 inline-flex text-xs px-2 py-1 rounded-full bg-yellow-100 text-themeOrange border border-yellow-300">
                  PropAdda {s.role}
                </div> */}
                <div className={cx("mt-1 inline-flex text-xs px-2 py-1 rounded-full", roleBadge(s.role))}>
                  {prettyRole(s.role)}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span>{s.phoneNumber ? `+91 ${s.phoneNumber}` : "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4" />
                <span>{s.email || "-"}</span>
              </div>

              {location && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right actions: Call / Email (same size as PropertySeekers) */}
          {/* <div className="flex flex-col items-end justify-between min-w-[9.5rem]">
            <div className="flex flex-col gap-2">
              <a
                href={phoneHref}
                onClick={(e) => !phoneHref && e.preventDefault()}
                className={btn(
                  "px-3 py-2 border-gray-200 bg-white hover:bg-yellow-50",
                  !phoneHref && "opacity-50 cursor-not-allowed"
                )}
                aria-disabled={!phoneHref}
                title={phoneHref ? `Call ${name}` : "Phone not available"}
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>

              <a
                href={mailHref}
                onClick={(e) => !mailHref && e.preventDefault()}
                className={btn(
                  "px-3 py-2 border-gray-200 bg-white hover:bg-yellow-50",
                  !mailHref && "opacity-50 cursor-not-allowed"
                )}
                aria-disabled={!mailHref}
                title={mailHref ? `Email ${name}` : "Email not available"}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
            </div>
            <div />
          </div> */}
        </div>
        
        {/* Aadhar link bottom-right */}
        {s.aadharUrl && (
          <div className="mt-3 flex justify-end">
            <a
              href={s.aadharUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-themeOrange hover:underline"
            >
              <FileText className="w-4 h-4" />
              Open Aadhar Card
            </a>
          </div>
        )}

        {/* Approve / Reject buttons (under profile + details) */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onApprove(s.userId)}
            className={btn(
              "px-3 py-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 flex-1"
            )}
          >
            Approve KYC
          </button>
          <button
            onClick={() => onReject(s.userId)}
            className={btn(
              "px-3 py-2 border-red-500 bg-red-50 hover:bg-red-100 text-red-700 flex-1"
            )}
          >
            Reject KYC
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------- Page -------- */
const KycRequests: React.FC = () => {
  const [pending, setPending] = useState<SellerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

   const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";


  // pagination
  const [page, setPage] = useState(1); // 1-based
  const pageSize = 8;

  // reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const navigate = useNavigate();

  // sort by userId DESC before paginating
  const sorted = useMemo(
    () => [...pending].sort((a, b) => b.userId - a.userId),
    [pending]
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  // numbered pagination window (1..10)
  const windowStart = Math.floor((page - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalPages);
  const numbers = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  );

  const fetchPending = async () => {
    setLoading(true);
    setErr(null);
    try {
      const resp = await axios.get<SellerResponse[]>(
        `${API_BASE_URL}/admin/pendingKycUsers`
      );
      setPending(resp.data || []);
      setPage(1);
    } catch (e) {
      console.error(e);
      setErr("Failed to load pending KYC requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // lock scroll when modal open
  useEffect(() => {
    if (!showRejectModal) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("wheel", prevent as EventListener, {
      passive: false,
    });
    document.addEventListener("touchmove", prevent as EventListener, {
      passive: false,
    });

    setTimeout(() => textareaRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevDocOverflow || "";
      document.removeEventListener("wheel", prevent as EventListener);
      document.removeEventListener("touchmove", prevent as EventListener);
    };
  }, [showRejectModal]);

  const approve = async (id: number) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/sellerKyc/approve/${id}`);
      navigate("/admin/users/agent");
    } catch (e) {
      console.error(e);
      alert("Approve failed");
    }
  };

  const openReject = (id: number) => {
    setRejectId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const cancelReject = () => {
    setShowRejectModal(false);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim() || !rejectId) {
      textareaRef.current?.focus();
      return;
    }
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/sellerKyc/reject/${rejectId}`,
        { reason: rejectReason.trim() }
      );
      setShowRejectModal(false);
      fetchPending();
    } catch (e) {
      console.error(e);
      alert("Reject failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with per-page result count */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800">KYC Requests</h2>
          <div className="text-sm text-gray-600 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">
            {loading ? "Loading..." : `${pageSlice.length} results`}
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-600">No pending KYC requests.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageSlice.map((s) => (
              <KycCard
                key={s.userId}
                s={s}
                onApprove={approve}
                onReject={openReject}
              />
            ))}
          </div>

          {/* Unified pagination (same template as other pages) */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6f3] px-4 py-3 border border-orange-100">
            <div className="text-sm text-gray-600">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={cx(
                  "text-sm text-gray-700",
                  page === 1 && "opacity-50 cursor-not-allowed"
                )}
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹ Previous Page
              </button>

              <div className="flex items-center">
                {numbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cx(
                      "mx-1 w-9 h-9 text-sm rounded-full border transition",
                      n === page
                        ? "bg-buttonOrange text-themeOrange border-themeOrange"
                        : "bg-white hover:bg-gray-50"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className={cx(
                  "text-sm text-gray-700",
                  page === totalPages && "opacity-50 cursor-not-allowed"
                )}
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next Page ›
              </button>
            </div>
          </div>
        </>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            style={{ backdropFilter: "blur(6px)" }}
            aria-hidden="true"
          />
          {/* Modal */}
          <div
            className="relative border-2 border-solid bg-white w-full max-w-xl rounded shadow-lg p-6 z-50"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <h3 className="text-lg font-semibold mb-2">
              Add reason to reject <span className="text-red-500">*</span>
            </h3>
            <textarea
              ref={textareaRef}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={6}
              className="w-full border rounded p-2 mb-4"
              placeholder="Write the reason for rejection (required)"
              aria-required
            />
            <div className="flex justify-end gap-3">
              <button onClick={cancelReject} className="px-4 py-2 rounded border">
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className={cx(
                  "px-4 py-2 rounded text-white",
                  rejectReason.trim()
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycRequests;
