// src/pages/admin/SoldListings.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { type Filters as SidebarFilters } from "../../components/FilterSidebar";
import {
  BedDouble,
  Bath,
  Eye,
  Building,
  Home,
  Tag,
  Briefcase,
  Maximize2,
  MapPin,
  CircleCheckBig,   // Alternative for area/size
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
  sold?: boolean;
  media?: MediaResponse[];
  mediaFiles?: MediaResponse[];
  residentialOwner?: OwnerResponse;
  commercialOwner?: OwnerResponse;
  cabins?: number;
  meetingRoom?: boolean;
  washroom?: boolean;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  lift?: boolean;
  parking?: boolean;
  lockIn?: number;
  yearlyIncrease?: number;
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
  poojaRoom?: boolean;
  studyRoom?: boolean;
  servantRoom?: boolean;
  storeRoom?: boolean;
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
  fitnessCenter?: boolean;
  swimmingPool?: boolean;
  clubhouseCommunityCenter?: boolean;
  securityPersonnel?: boolean;
  lifts?: boolean;
  separateEntryForServantRoom?: boolean;
  noOpenDrainageAround?: boolean;
  bankAttachedProperty?: boolean;
  lowDensitySociety?: boolean;
  municipalCorporation?: boolean;
  borewellTank?: boolean;
  water24x7?: boolean;
  overlookingPool?: boolean;
  overlookingParkGarden?: boolean;
  overlookingClub?: boolean;
  overlookingMainRoad?: boolean;
  inGatedSociety?: boolean;
  cornerProperty?: boolean;
  petFriendlySociety?: boolean;
  wheelchairFriendly?: boolean;
  closeToMetroStation?: boolean;
  closeToSchool?: boolean;
  closeToHospital?: boolean;
  closeToMarket?: boolean;
  closeToRailwayStation?: boolean;
  closeToAirport?: boolean;
  closeToMall?: boolean;
  closeToHighway?: boolean;
}

interface PageResponse {
  content?: PropertyResponse[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

/* --- Card --- */
const Card: React.FC<{
  p: PropertyResponse;
//   onUnmarkVip: (id: number, category: string) => void;
}> = ({ p }) => {
  const media = p.mediaFiles ?? p.media ?? [];
  const thumb = media.find((m) => m.ord === 1)?.url;
  const owner = p.residentialOwner ?? p.commercialOwner;

  return (
    <div
      className={`rounded-lg shadow-sm p-4 flex gap-4 border-2 ${
        p.sold ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-36 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
        {thumb ? (
          <img src={thumb} alt={p.title ?? "thumbnail"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
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
                {p.category && <span className="flex items-center gap-1.5"><Home className="w-4 h-4"/>{p.category}</span>}
                {p.preference && <span className="flex items-center gap-1.5"><Tag className="w-4 h-4"/>{p.preference}</span>}
                {p.propertyType && <span className="flex items-center gap-1.5"><Building className="w-4 h-4"/>{p.propertyType}</span>}
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
              {p.sold && (
                <div className="text-lg font-semibold text-emerald-600 bg-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <CircleCheckBig className="w-5 h-5" /> Sold
                </div>
              )}
              {/* {p.adminApproved && (
                <div className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {p.adminApproved}
                </div>
              )} */}
            </div>
          </div>
        </div>

        {p.description && (
          <div className="text-sm text-gray-600 mt-3 line-clamp-3">
            {p.description}
          </div>
        )}

        {owner && (
          <div className="text-xs text-gray-500 mt-3 border-t p-2">
            Owner: {owner.firstName ?? ""}{owner.lastName ? ` ${owner.lastName}` : ""}{owner.email ? ` • ${owner.email}` : ""}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-between items-end">
        <div className="flex flex-col gap-2">
          <Link
            to={`/admin/listings/view/${p.category ?? "Residential"}/${p.listingId}`}
            className="px-3 py-1 text-white text-center rounded text-sm bg-blue-600 transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-blue-700 flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" /> View Listing
          </Link>
          {/* <button
            onClick={() => onUnmarkVip(p.listingId, p.category ?? "Residential")}
            className="px-3 py-1 text-white rounded text-sm bg-rose-600 transition delay-150 duration-300 ease-in-out hover: hover:scale-105 hover:bg-rose-700 flex items-center justify-center gap-1"
          >
            <StarOff className="w-4 h-4" /> Unmark VIP
          </button> */}
        </div>
        <div className="text-xs text-gray-400 mt-2">ID: {p.listingId}</div>
      </div>
    </div>
  );
};

/* --- SoldListings page --- */
const SoldListings: React.FC = () => {
  const [, setRawData] = useState<PropertyResponse[]>([]);
  const [pageSlice, setPageSlice] = useState<PropertyResponse[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<SidebarFilters | null>(null);

   const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";


  useEffect(() => {
    fetch(appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

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

  const fetch = async (filters: SidebarFilters | null = null) => {
    setLoading(true);
    try {
      const paging = { page, size };
      const filterParams = buildParamsFromSidebar(filters);
      if (filters) {
        const resp = await axios.get<PageResponse | any>(`${API_BASE_URL}/admin/filterAllProperties`, {
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
        setRawData([]);
        setPageSlice([]);
        setTotalPages(0);
        setLoading(false);
        return;
      } else {
        const resp = await axios.get<PageResponse | any>(`${API_BASE_URL}/admin/soldProperties`, { params: paging });
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
        setRawData([]);
        setPageSlice([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("fetch sold properties error:", err);
      setRawData([]);
      setPageSlice([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Event handlers -------------------- */
  // const onFilterApply = (f: SidebarFilters) => {
  //   setAppliedFilters(f);
  //   setPage(0);
  //   fetch(f);
  // };

  // const onFilterReset = () => {
  //   setAppliedFilters(null);
  //   setPage(0);
  //   fetch(null);
  // };

//   const unmarkVip = async (id: number, category: string) => {
//     try {
//       await axios.patch(`${API_BASE_URL}/admin/toggleVip/${category}/${id}`);
//       fetch(appliedFilters); // refresh so removed from VIP list
//     } catch (e) {
//       console.error(e);
//       alert("Unmark VIP failed");
//     }
//   };

  // ----- Unified Pagination (windowed 1..10) -----
  const total = totalPages || 1;
  const current = page + 1; // 1-based
  const windowStart = Math.floor((current - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, total);
  const numbers = useMemo(
    () => Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i),
    [windowStart, windowEnd]
  );

  return (
    <div className="flex">
      {/* Sidebar */}
      {/* <FilterSidebar initial={appliedFilters ?? undefined} onApply={onFilterApply} onReset={onFilterReset} /> */}

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Sold Listings</h2>
          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `${pageSlice.length} results`}
          </div>
        </div>

        <div className="space-y-4">
          {pageSlice.length === 0 && !loading && <div className="text-gray-600">No Sold Listings found.</div>}

          {[...pageSlice]
            .sort((a, b) => (b?.listingId ?? 0) - (a?.listingId ?? 0)) // DESC by listingId
            .map((p) => (
              <Card key={p.listingId} p={p} />
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
      </main>
    </div>
  );
};

export default SoldListings;
