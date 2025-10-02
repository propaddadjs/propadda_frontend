// src/pages/admin/PendingListings.tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import FilterSidebar, { type Filters as SidebarFilters } from "../../components/FilterSidebar";
import {
  BedDouble,
  Bath,
  Star,
  BadgeCheck,
  TimerOff,
  Eye,
  Building,
  Home,
  Tag,
  Briefcase,
  Maximize2,
  ThumbsDown,
  ThumbsUp,
  Hourglass,
  MapPin,
  StarOff,
  BadgeX,   // Alternative for area/size
} from "lucide-react";

/* --- types --- */
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
  category: string;
  preference?: string;
  propertyType?: string;
  maintenance?: number;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  city?: string;
  state?: string;
  locality?: string;
  address?: string;
  pincode?: number;
  nearbyPlace?: string;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  facing?: string;
  floor?: number;
  age?: string;
  availability?: string;
  reraNumber?: string;
  reraVerified?: boolean;
  totalFloors?: number;
  securityDeposit?: number;
  balconies?: number;
  powerBackup?: string;
  coveredParking?: number;
  openParking?: number;
  adminApproved?: string;
  expired?: boolean;
  vip?: boolean;
  // media
  media?: MediaResponse[];       // fallback
  mediaFiles?: MediaResponse[];  // backend sample uses this
  // owner
  residentialOwner?: OwnerResponse;
  commercialOwner?: OwnerResponse;
  // commercial extras
  cabins?: number;
  meetingRoom?: boolean;
  washroom?: boolean;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  lift?: boolean;
  parking?: boolean;
  lockIn?: number;
  yearlyIncrease?: number;
  // amenities (partial list kept optional)
  centerCooling?: boolean;
  fireAlarm?: boolean;
  heating?: boolean;
  gym?: boolean;
  modularKitchen?: boolean;
  pool?: boolean;
  elevator?: boolean;
  petFriendly?: boolean;
  storage?: boolean;
  laundry?: boolean;
  dishwasher?: boolean;
  dryer?: boolean;
  sauna?: boolean;
  emergencyExit?: boolean;
  waterPurifier?: boolean;
  gasPipeline?: boolean;
  park?: boolean;
  vastuCompliant?: boolean;
  rainWaterHarvesting?: boolean;
  maintenanceStaff?: boolean;
  // Other Rooms
  poojaRoom?: boolean;
  studyRoom?: boolean;
  servantRoom?: boolean;
  storeRoom?: boolean;
  // Property Features
  highCeilingHeight?: boolean;
  falseCeilingLighting?: boolean;
  internetConnectivity?: boolean;
  centrallyAirConditioned?: boolean;
  securityFireAlarm?: boolean;
  recentlyRenovated?: boolean;
  privateGardenTerrace?: boolean;
  naturalLight?: boolean;
  airyRooms?: boolean;
  intercomFacility?: boolean;
  spaciousInteriors?: boolean;
  // Society or Building Features
  fitnessCenter?: boolean;
  swimmingPool?: boolean;
  clubhouseCommunityCenter?: boolean;
  securityPersonnel?: boolean;
  lifts?: boolean;
  // Additional Features
  separateEntryForServantRoom?: boolean;
  noOpenDrainageAround?: boolean;
  bankAttachedProperty?: boolean;
  lowDensitySociety?: boolean;
  // Water Source
  municipalCorporation?: boolean;
  borewellTank?: boolean;
  water24x7?: boolean;
  // Overlooking
  overlookingPool?: boolean;
  overlookingParkGarden?: boolean;
  overlookingClub?: boolean;
  overlookingMainRoad?: boolean;
  // Other Features
  inGatedSociety?: boolean;
  cornerProperty?: boolean;
  petFriendlySociety?: boolean;
  wheelchairFriendly?: boolean;
  // Location Advantages
  closeToMetroStation?: boolean;
  closeToSchool?: boolean;
  closeToHospital?: boolean;
  closeToMarket?: boolean;
  closeToRailwayStation?: boolean;
  closeToAirport?: boolean;
  closeToMall?: boolean;
  closeToHighway?: boolean;
  [key: string]: any;
}

interface PageResponse {
  content?: PropertyResponse[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

/* --- Card component --- */
/* --- Card component --- */
const Card: React.FC<{
  p: PropertyResponse;
  onApprove: (id: number, category: string) => void;
  onReject: (id: number, category: string) => void;
  onToggleVip: (id: number, category: string) => void;
  onToggleRera: (id: number, category: string) => void;
}> = ({ p, onApprove, onReject, onToggleVip, onToggleRera }) => {
  const media = p.mediaFiles ?? p.media ?? [];
  const thumb = media.find((m) => m.ord === 1)?.url;
  const owner = p.residentialOwner ?? p.commercialOwner;

  return (
    <div
      className={`rounded-lg shadow-sm p-4 flex gap-4 border-2 ${
        p.vip ? "border-yellow-500 bg-yellow-50" : "border-gray-200 bg-white"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-36 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
        {thumb ? (
          <img src={thumb} alt={p.title ?? "thumbnail"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-lg">{p.title ?? p.propertyType ?? "Untitled"}</div>
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {p.locality ? `${p.locality}, ` : ""}{p.city ?? ""}{p.address ? ` • ${p.address}` : ""}
            </div>
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1.5"><Home className="w-4 h-4" /> {p.category}</span> • 
              <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> {p.preference}</span> •
              <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {p.propertyType}</span>
            </div>
            <div className="mt-2 text-sm text-gray-700 flex items-center gap-3">
              {p.bedrooms !== undefined && <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4" /> {p.bedrooms} BHK</span>}
              {p.bathrooms !== undefined && <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {p.bathrooms} Bath</span>}
              {p.area !== undefined && <span className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4" /> {p.area} sq.ft</span>}
              {p.cabins !== undefined && <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {p.cabins} cabins</span>}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-bold">
              {p.price !== undefined ? `₹${Number(p.price).toLocaleString("en-IN")}` : "-"}
            </div>
            <div className="mt-2 flex flex-col items-end gap-2">
              {p.vip && <div className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded flex items-center gap-1"><Star className="w-3 h-3" /> VIP</div>}
              {p.reraVerified && <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> RERA Verified</div>}
              {p.expired && <div className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1"><TimerOff className="w-3 h-3" /> Expired</div>}
              {p.adminApproved && <div className="text-xs font-semibold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded flex items-center gap-1"><Hourglass className="w-3 h-3" /> {p.adminApproved}</div>}
            </div>
          </div>
        </div>

        {p.description && <div className="text-sm text-gray-600 mt-3 line-clamp-3">{p.description}</div>}

        {owner && (
          <div className="text-xs text-gray-500 mt-3 border-t p-2">
            Owner: {owner.firstName ?? ""}{owner.lastName ? ` ${owner.lastName}` : ""}{owner.email ? ` • ${owner.email}` : ""}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-between items-end">
        <div className="flex flex-col gap-2">
          <Link to={`/admin/listings/view/${p.category ?? "Residential"}/${p.listingId}`} className="px-3 py-1 text-white text-center rounded text-sm bg-blue-500 transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-blue-600 flex items-center justify-center gap-1">
            <Eye className="w-4 h-4" /> View Listing
          </Link>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onApprove(p.listingId, p.category)}
              className="px-3 py-1 text-white rounded text-sm bg-green-600 transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-green-700 flex items-center justify-center gap-1"
            >
              <ThumbsUp className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => onReject(p.listingId, p.category)}
              className="px-3 py-1 text-white rounded text-sm bg-red-600 transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-red-700 flex items-center justify-center gap-1"
            >
              <ThumbsDown className="w-4 h-4" /> Reject
            </button>

            {onToggleVip && (
              <button
                onClick={() => onToggleVip(p.listingId, p.category)}
                className="flex items-center justify-center gap-2 px-3 py-1.5 text-white rounded text-sm bg-yellow-400 transition hover:scale-105 hover:bg-yellow-500"
              >
                {p.vip ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />} {/* <-- Changed here */}
                {p.vip ? "Unmark VIP" : "Mark VIP"}
              </button>
            )}
            {p.reraNumber ? (
              onToggleRera ? (
                <button
                  onClick={() => onToggleRera(p.listingId, p.category)}
                  className="px-3 py-1 text-white rounded text-sm bg-purple-600 transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-purple-700 flex items-center justify-center gap-1"
                >
                  {p.reraVerified ? <BadgeX className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />} {/* <-- Changed here */}
                  {p.reraVerified ? "Unmark RERA Verified" : "Mark RERA Verified"}
                </button>
              ) : null
            ) : (
              <button
                disabled
                className="px-3 py-1 bg-gray-300 text-white rounded text-sm cursor-not-allowed flex items-center justify-center gap-1"
                title="RERA number not available for this listing"
              >
                <BadgeCheck className="w-4 h-4" /> Mark RERA Verified
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">ID: {p.listingId}</div>
      </div>
    </div>
  );
};

/* --- PendingListings page --- */
const PendingListings: React.FC = () => {
  const [rawData, setRawData] = useState<PropertyResponse[]>([]);
  const [pageSlice, setPageSlice] = useState<PropertyResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // store the sidebar filters (null if none applied)
  const [appliedFilters, setAppliedFilters] = useState<SidebarFilters | null>(null);

   const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";


  /* ---- Reject modal state (matches ListingDetail behavior) ---- */
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ id: number | null; category: string | null }>({ id: null, category: null });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fetch(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // lock scroll & focus textarea when modal opens (same as ListingDetail)
  useEffect(() => {
    if (!showRejectModal) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevDocOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const prevent = (e: Event) => { e.preventDefault(); };
    document.addEventListener("wheel", prevent as EventListener, { passive: false });
    document.addEventListener("touchmove", prevent as EventListener, { passive: false });

    setTimeout(() => textareaRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevDocOverflow || "";
      document.removeEventListener("wheel", prevent as EventListener);
      document.removeEventListener("touchmove", prevent as EventListener);
    };
  }, [showRejectModal]);

  /**
   * Build query params for /admin/filterProperties from SidebarFilters
   */
  const buildParamsFromSidebar = (f: SidebarFilters | null) => {
    if (!f) return {};
    const params: any = {};
    if (f.category && f.category !== "All") params.category = f.category;
    if (f.propertyTypes && f.propertyTypes.length) params.propertyTypes = f.propertyTypes.join(",");
    if (f.preference && f.preference !== "All") params.preference = f.preference;

    if (f.priceMin !== null && f.priceMax !== null && Number(f.priceMin) > Number(f.priceMax)) {
      params.priceMin = f.priceMax;
      params.priceMax = f.priceMin;
    } else {
      if (f.priceMin !== null) params.priceMin = f.priceMin;
      if (f.priceMax !== null) params.priceMax = f.priceMax;
    }
    if (f.furnishing) params.furnishing = f.furnishing;
    if (f.stateName) params.state = f.stateName;
    if (f.city) params.city = f.city;
    if (f.amenities && f.amenities.length) params.amenities = f.amenities.join(",");
    if (f.availability && f.availability !== "All") params.availability = f.availability;

    if (f.areaMin !== null && f.areaMax !== null && Number(f.areaMin) > Number(f.areaMax)) {
      params.areaMin = f.areaMax;
      params.areaMax = f.areaMin;
    } else {
      if (f.areaMin !== null) params.areaMin = f.areaMin;
      if (f.areaMax !== null) params.areaMax = f.areaMax;
    }
    if (f.ageRanges && f.ageRanges.length) params.ageRanges = f.ageRanges.join(",");
    console.log("params for filter: ", params);
    return params;
  };

  /**
   * fetch properties.
   * If filters provided -> call /admin/filterProperties with mapped params
   * else -> call /admin/allProperties to keep backwards compatibility
   */
  const fetch = async (filters: SidebarFilters | null = null) => {
    setLoading(true);
    try {
      const paging = { page, size };
      const filterParams = buildParamsFromSidebar(filters);
      if (filters) {
        // server-side filtered endpoint
        const resp = await axios.get<PageResponse | any>(`${API_BASE_URL}/admin/filterPendingProperties`, {
          params: { ...paging, ...filterParams },
        });
        const body = resp.data;

        if (body && Array.isArray(body.content)) {
          const pageContent: PropertyResponse[] = body.content;
          setRawData(pageContent);
          setPageSlice(pageContent);
          setTotalPages(body.totalPages ?? 1);
          setLoading(false);
          return;
        }
        // grouped or plain array fallback
        if (body && (Array.isArray(body.commercial) || Array.isArray(body.residential))) {
          const com: PropertyResponse[] = Array.isArray(body.commercial) ? body.commercial : [];
          const res: PropertyResponse[] = Array.isArray(body.residential) ? body.residential : [];
          const merged = [...com, ...res];
          setRawData(merged);
          const tp = Math.max(1, Math.ceil(merged.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(merged.slice(start, start + size));
          setLoading(false);
          return;
        }
        if (Array.isArray(body)) {
          setRawData(body);
          const tp = Math.max(1, Math.ceil(body.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(body.slice(start, start + size));
          setLoading(false);
          return;
        }
        // fallback
        setRawData([]);
        setPageSlice([]);
        setTotalPages(0);
        setLoading(false);
        return;
      } else {
        // no filters => call existing pending endpoint
        const resp = await axios.get<PageResponse | any>(`${API_BASE_URL}/admin/pendingProperties`, { params: paging });
        const body = resp.data;
        if (body && Array.isArray(body.content)) {
          const pageContent: PropertyResponse[] = body.content;
          setRawData(pageContent);
          setPageSlice(pageContent);
          setTotalPages(body.totalPages ?? 1);
          setLoading(false);
          return;
        }
        if (body && (Array.isArray(body.commercial) || Array.isArray(body.residential))) {
          const com: PropertyResponse[] = Array.isArray(body.commercial) ? body.commercial : [];
          const res: PropertyResponse[] = Array.isArray(body.residential) ? body.residential : [];
          const merged = [...com, ...res];
          setRawData(merged);
          const tp = Math.max(1, Math.ceil(merged.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(merged.slice(start, start + size));
          setLoading(false);
          return;
        }
        if (Array.isArray(body)) {
          setRawData(body);
          const tp = Math.max(1, Math.ceil(body.length / size));
          setTotalPages(tp);
          const start = page * size;
          setPageSlice(body.slice(start, start + size));
          setLoading(false);
          return;
        }
        // fallback
        setRawData([]);
        setPageSlice([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("fetch properties error:", err);
      setRawData([]);
      setPageSlice([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Event handlers -------------------- */
  const onFilterApply = (f: SidebarFilters) => {
    setAppliedFilters(f);
    setPage(0);
    fetch(f);
  };

  const onFilterReset = () => {
    setAppliedFilters(null);
    setPage(0);
    fetch(null);
  };

  /* --- action handlers --- */
  const approve = async (id: number, category: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/properties/approve/${category}/${id}`);
      fetch(appliedFilters);
    } catch (e) { console.error(e); alert("Approve failed"); }
  };

  // open modal instead of sending request immediately
  const reject = (id: number, category: string) => {
    setRejectTarget({ id, category });
    setRejectReason("");
    setShowRejectModal(true);
  };

  const toggleVip = async (id: number, category: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/toggleVip/${category}/${id}`);
      fetch(appliedFilters);
    } catch (e) { console.error(e); alert("VIP toggle failed"); }
  };

  const toggleRera = async (id: number, category: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/toggleReraVerified/${category}/${id}`);
      fetch(appliedFilters);
    } catch (e) { console.error(e); alert("RERA toggle failed"); }
  };

  // reject modal controls
  const cancelReject = () => setShowRejectModal(false);

  const confirmReject = async () => {
    if (!rejectReason || !rejectReason.trim()) {
      alert("Please provide a rejection reason (mandatory).");
      textareaRef.current?.focus();
      return;
    }
    if (!rejectTarget.id || !rejectTarget.category) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/properties/reject/${rejectTarget.category}/${rejectTarget.id}`,
        { reason: rejectReason.trim() }
      );
      setShowRejectModal(false);
      fetch(appliedFilters);
    } catch (e) {
      console.error(e);
      alert("Reject failed");
    }
  };

  const itemsToRender = pageSlice;

  // ----- Unified Pagination (windowed 1..10) -----
  const total = totalPages || 1;
  const current = page + 1; // 1-based for UI
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, total);
  const numbers = useMemo(
    () => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd]
  );

  return (
    <div className="flex">
      {/* Sidebar - use FilterSidebar */}
      <FilterSidebar
        initial={appliedFilters ?? undefined}
        onApply={onFilterApply}
        onReset={onFilterReset}
      />

      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pending Approval Listings</h2>
          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `${itemsToRender.length} results`}
          </div>
        </div>

        <div className="space-y-4">
          {!loading && itemsToRender.length === 0 && <div>No pending listings found.</div>}

          {[...itemsToRender]
            .sort((a, b) => (b?.listingId ?? 0) - (a?.listingId ?? 0)) // DESC by listingId
            .map((p) => (
              <Card
                key={p.listingId}
                p={p}
                onApprove={approve}
                onReject={reject}
                onToggleVip={toggleVip}
                onToggleRera={toggleRera}
              />
            ))}
        </div>

        {/* Unified pagination bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6f3] px-4 py-3 border border-orange-100">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{current}</span> of{" "}
            <span className="font-medium">{total}</span>
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
              onClick={() => setPage((p) => Math.min(p + 1, Math.max(0, total - 1)))}
              disabled={current >= total || loading}
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
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              className="border rounded-lg px-2 py-1 text-sm bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>
      </main>

      {/* Reject modal (same UX as ListingDetail) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            style={{ backdropFilter: 'blur(6px)' }}
            aria-hidden="true"
          />
          {/* Modal box */}
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
              <button onClick={cancelReject} className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded border">Cancel</button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className={`px-4 py-2 rounded text-white ${rejectReason.trim() ? "bg-red-600 hover:bg-red-700" : "bg-gray-300 cursor-not-allowed"}`}
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

export default PendingListings;
