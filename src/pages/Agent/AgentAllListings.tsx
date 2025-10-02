import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BedDouble,
  Bath,
  Eye,
  Briefcase,
  Maximize2,
  MapPin,
  Pencil,
  AlertTriangle,
  BadgeCheck,
  Star,
} from "lucide-react";

// --- Configuration ---
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

const AGENT_ID = 2; 
const PAGE_SIZE_OPTIONS = [5, 8, 10, 15]; // Available sizes for per-page selector

// --- Types (Reused from Admin) ---
interface MediaResponse { filename?: string; ord?: number; url: string; }
interface OwnerResponse {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

interface PropertyResponse {
  listingId: number;
  category: string; // "Residential" or "Commercial"
  preference?: string; // "Sale", "Rent", or "PG"
  propertyType?: string;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  city?: string;
  locality?: string;
  address?: string;
  bedrooms?: number; // Residential
  bathrooms?: number; // Residential
  cabins?: number; // Commercial
  media?: MediaResponse[];
  mediaFiles?: MediaResponse[];
  residentialOwner?: OwnerResponse;
  commercialOwner?: OwnerResponse;
  reraVerified?: boolean; 
  vip?: boolean; 
  createdAt?: string; 
  [key: string]: any;
}

// Custom response type for the agent endpoint
type AgentAllPropertiesResponse = {
    Commercial: PropertyResponse[];
    Residential: PropertyResponse[];
}

// --- Helper Components and Functions ---

/**
 * Maps property preference to a display string and style.
 */
const getPreferenceTag = (preference?: string): { text: string; bgColor: string } => {
    switch (preference?.toLowerCase()) {
        case 'rent':
            return { text: "For Rent", bgColor: "bg-blue-500" };
        case 'sale':
            return { text: "For Sale", bgColor: "bg-red-500" };
        case 'pg':
            return { text: "For PG", bgColor: "bg-green-500" };
        default:
            return { text: "N/A", bgColor: "bg-gray-400" };
    }
};

/* Card component for Agent List */
const AgentListingCard: React.FC<{ p: PropertyResponse }> = ({ p }) => {
  // const navigate = useNavigate();
  const media = p.mediaFiles ?? p.media ?? [];
  const thumb = media.find((m) => m.ord === 1)?.url;
  
  const { text: preferenceText, bgColor: preferenceBgColor } = getPreferenceTag(p.preference);
  
  const formattedPrice = p.price !== undefined ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Price N/A";
  const listingDetailPath = `/agent/listings/view/${p.category ?? "Residential"}/${p.listingId}`;
  const editListingPath = `/agent/listings/edit/${p.category ?? "Residential"}/${p.listingId}`; // Assuming an edit route

  return (
    <div
      // Kept the transition/hover effects as requested
      className="rounded-xl shadow-md flex flex-col border-2 border-gray-200 bg-white overflow-hidden transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:shadow-lg hover:border-orange-500"
    >
      {/* Thumbnail and Status */}
      <div className="w-full h-40 flex-shrink-0 bg-gray-100 relative">
        {thumb ? (
          <img src={thumb} alt={p.title ?? "thumbnail"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
        
        {/* Preference Badge */}
        <div className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded ${preferenceBgColor} text-white`}>
            {preferenceText}
        </div>

        {/* Status Tags (RERA Verified / Featured) */}
        <div className="absolute top-2 right-2 flex flex-col items-end space-y-1">
            {p.reraVerified && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-300">
                    <BadgeCheck className="w-3 h-3" /> RERA Verified
                </span>
            )}
            {p.vip && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                    <Star className="w-3 h-3" /> Featured
                </span>
            )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Details Section */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg text-gray-900 truncate" title={p.title ?? p.propertyType ?? "Untitled"}>{p.title ?? p.propertyType ?? "Untitled"}</div>
          
          {/* Location */}
          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span title={p.locality ? `${p.locality}, ${p.city ?? ""}` : p.city ?? ""}>
                {p.locality ? `${p.locality}, ` : ""}{p.city ?? ""}
            </span>
          </div>

          {/* Specs */}
          <div className="mt-2 text-sm text-gray-700 flex flex-wrap items-center gap-x-3 gap-y-1">
            {p.category === 'Residential' && p.bedrooms !== undefined && <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-gray-600" /> {p.bedrooms} BHK</span>}
            {p.category === 'Residential' && p.bathrooms !== undefined && <span className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-gray-600" /> {p.bathrooms} Bath</span>}
            {p.category === 'Commercial' && p.cabins !== undefined && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-600" /> {p.cabins} Cabins</span>}
            {p.area !== undefined && <span className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4 text-gray-600" /> {p.area} sq.ft</span>}
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xl font-bold text-orange-500">
                {formattedPrice}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 flex-shrink-0 mt-4 border-t pt-4">
          <Link 
              to={listingDetailPath} 
              className="flex-1 px-4 py-2 text-white text-center rounded-lg text-sm bg-orange-500 transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-orange-600 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" /> View
          </Link>
          <Link 
              to={editListingPath} 
              className="flex-1 px-4 py-2 text-orange-500 border border-orange-500 text-center rounded-lg text-sm transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Link>
        </div>
      </div>
    </div>
  );
};


/* All Listings Page */
const AgentAllListings: React.FC = () => {
  // We'll fetch all data once and handle pagination on the client side
  const [rawData, setRawData] = useState<PropertyResponse[]>([]);
  const [pageSlice, setPageSlice] = useState<PropertyResponse[]>([]);
  const [page, setPage] = useState<number>(0); // 0-based index
  const [size, setSize] = useState<number>(8); // Default page size
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- Pagination Slice Effect ---
  // Update the visible slice of data whenever rawData, page, or size changes
  useEffect(() => {
    const start = page * size;
    const end = start + size;
    setPageSlice(rawData.slice(start, end));
    // Ensure the page state is valid when rawData changes (e.g., if total pages decrease)
    if (page * size >= rawData.length && rawData.length > 0) {
        setPage(Math.max(0, Math.ceil(rawData.length / size) - 1));
    } else if (rawData.length === 0) {
        setPage(0);
    }
  }, [rawData, page, size]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: Fetching all properties in one go for client-side pagination
      const resp = await axios.get<AgentAllPropertiesResponse>(
        `${API_BASE_URL}/agent/allPropertiesByAgent/${AGENT_ID}`
      );
      const data = resp.data;

      if (data && (Array.isArray(data.Commercial) || Array.isArray(data.Residential))) {
        const commercial = Array.isArray(data.Commercial) ? data.Commercial : [];
        const residential = Array.isArray(data.Residential) ? data.Residential : [];
        const merged = [...commercial, ...residential];
        
        // Sort by listingId descending to show latest first
        merged.sort((a, b) => (b.listingId ?? 0) - (a.listingId ?? 0));
        
        setRawData(merged);
      } else {
        setRawData([]);
      }
    } catch (err) {
      console.error("Fetch agent properties error:", err);
      setError("Failed to load listings. Please check the API status.");
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination Logic ---
  const totalItems = rawData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const current = page + 1; // 1-based index
  
  // Logic for the unified pagination window (1..10, 11..20, etc.)
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalPages);
  const numbers = useMemo(
    () => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd, totalPages]
  );
  
  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page when size changes
  };


  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Active Listings</h2>
        <div className="text-sm text-gray-600">
          {loading ? "Loading..." : `${totalItems} total listings`}
        </div>
      </div>

      {/* Content Area */}
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
      ) : rawData.length === 0 ? ( // FIX: Changed listings.length to rawData.length
        <div className="p-8 text-center bg-white rounded-xl shadow-sm text-gray-600">
          You have no properties listed yet.
          <Link to="/agent/listings/create" className="text-orange-500 hover:underline block mt-2">
            Click here to add your first property.
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pageSlice.map((p) => (
              <AgentListingCard key={p.listingId} p={p} />
            ))}
          </div>

          {/* Unified Pagination Bar (Copied from Admin Logic) */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-orange-50 px-4 py-3 border border-orange-100">
              <div className="text-sm text-gray-600">
                Showing {Math.min(page * size + 1, totalItems)} - {Math.min(page * size + size, totalItems)} of <span className="font-medium">{totalItems}</span> listings
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

              {/* Per-page selector */}
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
        </div>
      )}
    </div>
  );
};

export default AgentAllListings;