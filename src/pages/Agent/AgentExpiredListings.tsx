import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BedDouble,
  Bath,
  Briefcase,
  Maximize2,
  MapPin,
  AlertTriangle,
  Star,
  RefreshCw,
  Trash2,
  TimerOff,
  X,
  Loader2,
} from "lucide-react";

// --- Configuration ---
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

const AGENT_ID = 2;
const PAGE_SIZE_OPTIONS = [5, 8, 10, 15];

// --- Types ---
interface MediaResponse { filename?: string; ord?: number; url: string; }
interface PropertyResponse {
  listingId: number;
  category: string; // "Residential" | "Commercial"
  preference?: string;
  propertyType?: string;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  city?: string;
  locality?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  cabins?: number;
  media?: MediaResponse[];
  mediaFiles?: MediaResponse[];
  reraVerified?: boolean;
  vip?: boolean;
  [key: string]: any;
}

type AgentAllPropertiesResponse = {
  Commercial: PropertyResponse[];
  Residential: PropertyResponse[];
};

// --- Helpers ---
const getPreferenceTag = (preference?: string): { text: string; bgColor: string } => {
  switch (preference?.toLowerCase()) {
    case "rent": return { text: "For Rent", bgColor: "bg-blue-500" };
    case "sale": return { text: "For Sale", bgColor: "bg-red-500" };
    case "pg":   return { text: "For PG", bgColor: "bg-green-500" };
    default:     return { text: "N/A", bgColor: "bg-gray-400" };
  }
};

/* Card */
const AgentExpiredListingCard: React.FC<{
  p: PropertyResponse;
  onAskDelete: (property: PropertyResponse) => void;
  onRenew: (id: number, category: string) => void;
  busy?: boolean;
}> = ({ p, onAskDelete, onRenew, busy }) => {
  const media = p.mediaFiles ?? p.media ?? [];
  const thumb = media.find((m) => m.ord === 1)?.url;
  const { text: preferenceText, bgColor: preferenceBgColor } = getPreferenceTag(p.preference);
  const priceSuffix = p.preference?.toLowerCase() === "rent" || p.preference?.toLowerCase() === "pg" ? "/month" : "";
  const formattedPrice = p.price !== undefined ? `₹${Number(p.price).toLocaleString("en-IN")}${priceSuffix}` : "Price N/A";

  return (
    <div className="rounded-xl shadow-md flex flex-col border-2 border-gray-400 bg-gray-50 overflow-hidden transition duration-300 hover:scale-[1.01] hover:shadow-xl">
      <div className="w-full h-40 flex-shrink-0 bg-gray-200 relative">
        {thumb ? (
          <img src={thumb} alt={p.title ?? "thumbnail"} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No image</div>
        )}

        <div className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded ${preferenceBgColor} text-white`}>
          {preferenceText}
        </div>

        <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
          <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-red-600 text-white border border-red-800">
            <TimerOff className="w-3 h-3" /> EXPIRED
          </span>
          {p.vip && (
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg text-gray-900 truncate" title={p.title ?? p.propertyType ?? "Untitled"}>
            {p.title ?? p.propertyType ?? "Untitled"}
          </div>

          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span title={p.locality ? `${p.locality}, ${p.city ?? ""}` : p.city ?? ""}>
              {p.locality ? `${p.locality}, ` : ""}{p.city ?? ""}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-700 flex flex-wrap items-center gap-x-3 gap-y-1">
            {p.category === "Residential" && p.bedrooms !== undefined && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-gray-600" /> {p.bedrooms} BHK
              </span>
            )}
            {p.category === "Residential" && p.bathrooms !== undefined && (
              <span className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-gray-600" /> {p.bathrooms} Bath
              </span>
            )}
            {p.category === "Commercial" && p.cabins !== undefined && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gray-600" /> {p.cabins} Cabins
              </span>
            )}
            {p.area !== undefined && (
              <span className="flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-gray-600" /> {p.area} sq.ft
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xl font-bold text-gray-600">
              {formattedPrice}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3 flex-shrink-0 mt-4 border-t pt-4">
          <button
            onClick={() => onAskDelete(p)}
            disabled={busy}
            className="flex-1 px-4 py-2 text-white text-center rounded-lg text-sm bg-gray-600 transition hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
          </button>
          <button
            onClick={() => onRenew(p.listingId, p.category)}
            disabled={busy}
            className="flex-1 px-4 py-2 text-white border border-orange-500 text-center rounded-lg text-sm bg-orange-500 transition hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Renew
          </button>
        </div>
      </div>
    </div>
  );
};

/* Page */
const AgentExpiredListings: React.FC = () => {
  const navigate = useNavigate();

  const [rawData, setRawData] = useState<PropertyResponse[]>([]);
  const [pageSlice, setPageSlice] = useState<PropertyResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(8);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PropertyResponse | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.get<AgentAllPropertiesResponse>(
        `${API_BASE_URL}/agent/expiredPropertiesByAgent/${AGENT_ID}`
      );
      const data = resp.data;

      if (data && (Array.isArray(data.Commercial) || Array.isArray(data.Residential))) {
        const merged = [
          ...(Array.isArray(data.Commercial) ? data.Commercial : []),
          ...(Array.isArray(data.Residential) ? data.Residential : []),
        ].sort((a, b) => (b.listingId ?? 0) - (a.listingId ?? 0));

        setRawData(merged);
      } else {
        setRawData([]);
      }
    } catch (err) {
      console.error("Fetch agent expired properties error:", err);
      setError("Failed to load expired listings. Please check the API status.");
      setRawData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // Renew handler
  const handleRenew = async (id: number, category: string) => {
    if (!id || !category) return;
    try {
      setBusy(true);
      await axios.patch(`${API_BASE_URL}/agent/renewProperty/${category}/${id}/${AGENT_ID}`);
      alert("Your listing was sent to the admin for approval.");
      navigate("/agent/listings/pending");
    } catch (e) {
      console.error(e);
      alert("Renewal failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Ask delete (open modal)
  const askDelete = (property: PropertyResponse) => {
    setPendingDelete(property);
    setConfirmOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { listingId, category } = pendingDelete;

    const isCommercial = category?.toLowerCase() === "commercial";
    const url = isCommercial
      ? `${API_BASE_URL}/commercial-properties/deleteProperty/${listingId}/${AGENT_ID}`
      : `${API_BASE_URL}/residential-properties/deleteProperty/${listingId}/${AGENT_ID}`;

    try {
      setBusy(true);
      await axios.delete(url);
      setConfirmOpen(false);
      setPendingDelete(null);
      await fetchListings(); // refresh after delete
    } catch (e) {
      console.error(e);
      alert("Deletion failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Pagination slice
  useEffect(() => {
    const start = page * size;
    const end = start + size;
    setPageSlice(rawData.slice(start, end));
    if (page * size >= rawData.length && rawData.length > 0) {
      setPage(Math.max(0, Math.ceil(rawData.length / size) - 1));
    } else if (rawData.length === 0) {
      setPage(0);
    }
  }, [rawData, page, size]);

  // Pagination helpers
  const totalItems = rawData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const current = page + 1;
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalPages);
  const numbers = useMemo(
    () => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd, totalPages]
  );

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expired Listings</h2>
        <div className="text-sm text-gray-600">
          {loading ? "Loading..." : `${totalItems} total expired listings`}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: size }).map((_, i) => (
            <div key={i} className="flex flex-col border rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="w-full h-40 bg-gray-100 rounded-t-xl animate-pulse" />
              <div className="p-4 space-y-2 flex-1">
                <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                <div className="pt-4 flex gap-3">
                  <div className="h-9 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-9 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg border border-red-300 bg-red-100 text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      ) : rawData.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl shadow-sm text-gray-600">
          You have no properties that are currently expired.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pageSlice.map((p) => (
              <AgentExpiredListingCard
                key={p.listingId}
                p={p}
                onAskDelete={askDelete}
                onRenew={handleRenew}
                busy={busy}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-orange-50 px-4 py-3 border border-orange-100">
              <div className="text-sm text-gray-600">
                Showing {Math.min(page * size + 1, totalItems)} - {Math.min(page * size + size, totalItems)} of{" "}
                <span className="font-medium">{totalItems}</span> listings
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-sm text-gray-700 disabled:opacity-50 hover:text-orange-500 transition"
                >
                  ‹ Previous
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
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                  disabled={current >= totalPages}
                  className="text-sm text-gray-700 disabled:opacity-50 hover:text-orange-500 transition"
                >
                  Next ›
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Per page:</span>
                <select
                  value={size}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="border rounded-lg px-2 py-1 text-sm bg-white focus:ring-orange-500 focus:border-orange-500"
                >
                  {PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmOpen && pendingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900">Delete this listing?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete this listing. Once deleted, it cannot be restored again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !busy && setConfirmOpen(false)}
                className="ml-auto rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentExpiredListings;
