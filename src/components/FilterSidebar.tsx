// src/components/FilterSidebar.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  Shapes,
  Building,
  Tag,
  IndianRupee,
  Armchair,
  MapPin,
  Sparkles,
  CalendarCheck,
  Maximize2,
  History,
  ChevronUp,
  ChevronDown,
  Search,
  RotateCw,
} from "lucide-react";

/**
 * Public Filters type (exported)
 */
export type Filters = {
  category: "All" | "Residential" | "Commercial";
  propertyTypes: string[]; // checkboxes
  preference: "All" | "Rent" | "Sell" | "PG";
  priceMin?: number | null;
  priceMax?: number | null;
  furnishing?: "" | "Unfurnished" | "Semi-furnished" | "Fully-furnished";
  stateIso?: string; // state ISO2 code from countrystatecity API
  stateName?: string;
  city?: string;
  amenities: string[];
  availability: "All" | "Ready to move" | "Under Construction";
  areaMin?: number | null;
  areaMax?: number | null;
  ageRanges: string[]; // checkbox values
};

const DEFAULT_FILTERS: Filters = {
  category: "All",
  propertyTypes: [],
  preference: "All",
  priceMin: null,
  priceMax: null,
  furnishing: "",
  stateIso: "",
  stateName: "",
  city: "",
  amenities: [],
  availability: "All",
  areaMin: null,
  areaMax: null,
  ageRanges: [],
};

// const PROPERTY_TYPES = [
//   "Flat",
//   "House",
//   "Villa",
//   "Apartment",
//   "Office",
//   "Plot/Land",
//   "Storage/Warehouse",
// ];
// define the sets
const RESIDENTIAL_TYPES = ["Flat", "House", "Villa", "Apartment"];
const COMMERCIAL_TYPES = ["Office", "Plot/Land", "Storage/Warehouse"];

const PREFERENCES = ["Rent", "Sell", "PG"];
const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully-furnished"];
const AVAILABILITY = ["Ready to move", "Under Construction"];
const AGE_OPTIONS = [
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5-10 Years",
  "10-15 Years",
  "More than 15 years old",
];

// simplified amenity list (you can extend)
const ALL_AMENITIES = [
  "Elevator",
  "Water 24x7",
  "Gas Pipeline",
  "Pet Friendly",
  "Emergency Exit",
  "Wheelchair Friendly",
  "Vastu Compliant",
  "Pooja Room",
  "Study Room",
  "Servant Room",
  "Store Room",
  "Modular Kitchen",
  "High Ceiling Height",
  "Park",
  "Swimming Pool",
  "Gym",
  "Clubhouse / Community Center",
  "Municipal Corporation",
  "In Gated Society",
  "Corner Property",
];

type Props = {
  initial?: Partial<Filters>;
  onApply: (f: Filters) => void;
  onReset?: () => void;
};

const MAX_PRICE = 100000000; // 10 crore default max budget
const MAX_AREA = 1000000; // 1,000,000 sq.ft default max area
const SLIDER_COLOR = "#ff671f";

const FilterSidebar: React.FC<Props> = ({ initial = {}, onApply, onReset }) => {
  // Merge initial into defaults, ensure numeric fields are null or number
  const initialMerged: Filters = {
    ...DEFAULT_FILTERS,
    ...initial,
    priceMin: initial.priceMin ?? DEFAULT_FILTERS.priceMin,
    priceMax: initial.priceMax ?? DEFAULT_FILTERS.priceMax,
    areaMin: initial.areaMin ?? DEFAULT_FILTERS.areaMin,
    areaMax: initial.areaMax ?? DEFAULT_FILTERS.areaMax,
  };

  const [filters, setFilters] = useState<Filters>(initialMerged);
  const [states, setStates] = useState<{ name: string; iso2: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [amenitiesExpanded, setAmenitiesExpanded] = useState(false);

  // NEW: collapse/expand state
  const [collapsed, setCollapsed] = useState(true);

  // CountryStateCity API key (if set in env)
  const CSC_API_KEY = (import.meta.env.VITE_CSC_API_KEY as string) || "ZXBOVkxVdmVaNjhiMHlqQm5PZXpxWmRSanlIUHB4a0hCSHBwNGRFRA==";

  // Derived conditions
  const isCommercial = filters.category === "Commercial";
  const onlyPlotSelected =
    filters.propertyTypes.length === 1 && filters.propertyTypes[0] === "Plot/Land";

  // preference options based on category
  const preferenceOptions = useMemo(
    () => (isCommercial ? ["Rent", "Sell"] : PREFERENCES),
    [isCommercial]
  );

  // property types based on category
  const propertyTypesToShow = useMemo(() => {
    if (filters.category === "Residential") return RESIDENTIAL_TYPES;
    if (filters.category === "Commercial") return COMMERCIAL_TYPES;
    // "All" → show both sets
    return [...RESIDENTIAL_TYPES, ...COMMERCIAL_TYPES];
  }, [filters.category]);

  // load states once
  useEffect(() => {
    const loadStates = async () => {
      try {
        if (!CSC_API_KEY) return;
        const resp = await axios.get(
          "https://api.countrystatecity.in/v1/countries/IN/states",
          {
            headers: { "X-CSCAPI-KEY": CSC_API_KEY },
          }
        );
        setStates(
          resp.data.map((s: any) => ({ name: s.name, iso2: s.iso2 }))
        );
      } catch (e) {
        console.warn("State load failed", e);
      }
    };
    loadStates();
  }, [CSC_API_KEY]);

  // when stateIso changes, load cities
  useEffect(() => {
    const iso = filters.stateIso;
    if (!iso || !CSC_API_KEY) {
      setCities([]);
      return;
    }
    const loadCities = async () => {
      try {
        const resp = await axios.get(
          `https://api.countrystatecity.in/v1/countries/IN/states/${iso}/cities`,
          {
            headers: { "X-CSCAPI-KEY": CSC_API_KEY },
          }
        );
        setCities(resp.data.map((c: any) => c.name));
      } catch (e) {
        console.warn("City load failed", e);
        setCities([]);
      }
    };
    loadCities();
  }, [filters.stateIso, CSC_API_KEY]);

  // checkbox helpers
  const togglePropType = (pt: string) => {
    setFilters((s) => ({
      ...s,
      propertyTypes: s.propertyTypes.includes(pt)
        ? s.propertyTypes.filter((x) => x !== pt)
        : [...s.propertyTypes, pt],
    }));
  };
  const toggleAmenity = (am: string) => {
    setFilters((s) => ({
      ...s,
      amenities: s.amenities.includes(am)
        ? s.amenities.filter((x) => x !== am)
        : [...s.amenities, am],
    }));
  };
  const toggleAge = (age: string) => {
    setFilters((s) => ({
      ...s,
      ageRanges: s.ageRanges.includes(age)
        ? s.ageRanges.filter((x) => x !== age)
        : [...s.ageRanges, age],
    }));
  };

  // Price slider handlers
  const handlePriceSliderChange = (vals: number[]) => {
    const [min, max] = vals;
    setFilters((prev) => ({
      ...prev,
      priceMin: Number(min),
      priceMax: Number(max),
    }));
  };

  // Area slider handlers
  const handleAreaSliderChange = (vals: number[]) => {
    const [min, max] = vals;
    setFilters((prev) => ({
      ...prev,
      areaMin: Number(min),
      areaMax: Number(max),
    }));
  };

  // Input change helpers that enforce min <= max
  const updatePriceMin = (val: number | null) => {
    setFilters((prev) => {
      const newMin = val;
      const curMax = prev.priceMax ?? MAX_PRICE;
      const newMax = newMin !== null && curMax < newMin ? newMin : curMax;
      return { ...prev, priceMin: newMin, priceMax: newMax };
    });
  };
  const updatePriceMax = (val: number | null) => {
    setFilters((prev) => {
      const newMax = val;
      const curMin = prev.priceMin ?? 0;
      const newMin = newMax !== null && curMin > newMax ? newMax : curMin;
      return { ...prev, priceMax: newMax, priceMin: newMin };
    });
  };

  const updateAreaMin = (val: number | null) => {
    setFilters((prev) => {
      const newMin = val;
      const curMax = prev.areaMax ?? MAX_AREA;
      const newMax = newMin !== null && curMax < newMin ? newMin : curMax;
      return { ...prev, areaMin: newMin, areaMax: newMax };
    });
  };
  const updateAreaMax = (val: number | null) => {
    setFilters((prev) => {
      const newMax = val;
      const curMin = prev.areaMin ?? 0;
      const newMin = newMax !== null && curMin > newMax ? newMax : curMin;
      return { ...prev, areaMax: newMax, areaMin: newMin };
    });
  };

  const apply = () => {
    // ensure numeric fields are numbers or null and min<=max (defensive)
    const priceMin = filters.priceMin === null ? null : Number(filters.priceMin);
    const priceMax = filters.priceMax === null ? null : Number(filters.priceMax);
    const areaMin = filters.areaMin === null ? null : Number(filters.areaMin);
    const areaMax = filters.areaMax === null ? null : Number(filters.areaMax);

    // final normalization: if both present but min>max, swap
    const finalPriceMin =
      priceMin !== null && priceMax !== null && priceMin > priceMax
        ? priceMax
        : priceMin;
    const finalPriceMax =
      priceMin !== null && priceMax !== null && priceMin > priceMax
        ? priceMin
        : priceMax;
    const finalAreaMin =
      areaMin !== null && areaMax !== null && areaMin > areaMax
        ? areaMax
        : areaMin;
    const finalAreaMax =
      areaMin !== null && areaMax !== null && areaMin > areaMax
        ? areaMin
        : areaMax;

    const normalized: Filters = {
      ...filters,
      priceMin: finalPriceMin,
      priceMax: finalPriceMax,
      areaMin: finalAreaMin,
      areaMax: finalAreaMax,
    };
    onApply(normalized);
  };

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    setCities([]);
    setAmenitiesExpanded(false);
    if (onReset) onReset();
  };

  const visibleAmenities = amenitiesExpanded
    ? ALL_AMENITIES
    : ALL_AMENITIES.slice(0, 6);

  return (
    <aside
      className={`${
        collapsed ? "w-14" : "w-72"
      } bg-white border-r p-3 transition-all duration-200 shrink-0`}
      aria-label="Filter sidebar"
    >
      {/* Header with collapse button */}
      <div className="flex items-center justify-between mb-3">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-buttonOrange flex items-center justify-center">
              <FilterIcon className="w-4 h-4 text-themeOrange" />
            </div>
            <h3 className="text-base font-bold">Filters</h3>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center">
            <FilterIcon className="w-5 h-5 text-themeOrange" />
          </div>
        )}

        <button
          className="p-1.5 rounded-md hover:bg-gray-50"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expand filters" : "Collapse filters"}
          aria-label={collapsed ? "Expand filters" : "Collapse filters"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Collapsed placeholder */}
      {collapsed && (
        <div className="text-xs text-gray-500 text-center">
          Click to apply filters
        </div>
      )}

      {/* Content (hidden when collapsed) */}
      {!collapsed && (
        <>
          {/* Category */}
          <label className="block text-sm mb-1 font-semibold flex items-center gap-2"><Shapes className="w-4 h-4"/>Category</label>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: e.target.value as any }))
            }
            className="w-full text-sm border rounded p-2 mb-3"
          >
            <option value="All">All</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>

          {/* Property types */}
          <div className="mb-3">
            <div className="text-sm mb-1 font-semibold flex items-center gap-2"><Building className="w-4 h-4"/>Property Type</div>
            <div className="grid grid-cols-2 gap-1">
              {propertyTypesToShow.map((pt) => (
                <label key={pt} className="text-xs">
                  <input
                    type="checkbox"
                    checked={filters.propertyTypes.includes(pt)}
                    onChange={() => togglePropType(pt)}
                    className="mr-2"
                  />
                  {pt}
                </label>
              ))}
            </div>
          </div>

          {/* Preference */}
          <label className="block text-sm mb-1 font-semibold flex items-center gap-2"><Tag className="w-4 h-4"/>Preference</label>
          <select
            value={
              isCommercial && filters.preference === "PG"
                ? "All"
                : filters.preference
            }
            onChange={(e) =>
              setFilters((f) => ({ ...f, preference: e.target.value as any }))
            }
            className="w-full text-sm border rounded p-2 mb-3"
          >
            <option value="All">All</option>
            {preferenceOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Budget */}
          <label className="block text-sm mb-1 font-semibold flex items-center gap-2">
            <IndianRupee className="w-4 h-4" /> Budget (₹)
          </label>
          <div className="mb-4">
            <Slider
              range
              min={0}
              max={MAX_PRICE}
              step={10000}
              value={[filters.priceMin ?? 0, filters.priceMax ?? MAX_PRICE]}
              onChange={(v) =>
                handlePriceSliderChange(Array.isArray(v) ? v : [v, v])
              }
              trackStyle={[{ backgroundColor: SLIDER_COLOR }]}
              handleStyle={[
                { borderColor: SLIDER_COLOR },
                { borderColor: SLIDER_COLOR },
              ]}
              railStyle={{ backgroundColor: "#e5e7eb" }}
            />
            <div className="flex justify-between mt-2">
              <input
                type="number"
                min={0}
                max={MAX_PRICE}
                value={filters.priceMin ?? ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? null : Number(e.target.value);
                  updatePriceMin(val);
                }}
                className="w-1/2 border rounded p-2 mr-2"
                placeholder="Min"
              />
              <input
                type="number"
                min={0}
                max={MAX_PRICE}
                value={filters.priceMax ?? ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? null : Number(e.target.value);
                  updatePriceMax(val);
                }}
                className="w-1/2 border rounded p-2"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Furnishing */}
          {!isCommercial && (
            <>
              <label className="block text-sm mb-1 font-semibold flex items-center gap-2">
                <Armchair className="w-4 h-4"/> Furnishing
              </label>
              <select
                value={filters.furnishing}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    furnishing: e.target.value as any,
                  }))
                }
                className="w-full text-sm border rounded p-2 mb-3"
              >
                <option value="">Any</option>
                {FURNISHING.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* State & City */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-sm mb-1 font-semibold flex items-center gap-2"><MapPin className="w-4 h-4"/>State</label>
              <select
                value={filters.stateIso}
                onChange={(e) => {
                  const iso = e.target.value;
                  const name =
                    states.find((s) => s.iso2 === iso)?.name ?? "";
                  setFilters((f) => ({
                    ...f,
                    stateIso: iso,
                    stateName: name,
                    city: "",
                  }));
                }}
                className="w-full text-sm border rounded p-2"
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.iso2} value={s.iso2}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1 font-semibold">City</label>
              <select
                value={filters.city}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, city: e.target.value }))
                }
                className="w-full text-sm border rounded p-2"
              >
                <option value="">Any</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities */}
          {!isCommercial && (
            <div className="mb-3">
              <div className="text-sm mb-1 font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4"/>Amenities</div>
              <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
                {visibleAmenities.map((am) => (
                  <label key={am} className="text-xs">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(am)}
                      onChange={() => toggleAmenity(am)}
                      className="mr-2"
                    />
                    {am}
                  </label>
                ))}
              </div>
              <button
                className="mt-2 font-semibold text-xs text-themeOrange hover:underline flex items-center gap-1"
                onClick={() => setAmenitiesExpanded((v) => !v)}
              >
                {amenitiesExpanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                {amenitiesExpanded
                  ? "Show less"
                  : `Show more (${ALL_AMENITIES.length - 6})`}
              </button>
            </div>
          )}

          {/* Availability */}
          <label className="block text-sm mb-1 font-semibold flex items-center gap-2"><CalendarCheck className="w-4 h-4"/>Availability</label>
          <select
            value={filters.availability}
            onChange={(e) =>
              setFilters((f) => ({ ...f, availability: e.target.value as any }))
            }
            className={`w-full text-sm border rounded p-2 mb-3 ${
              onlyPlotSelected ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            disabled={onlyPlotSelected}
            title={
              onlyPlotSelected
                ? "Availability not applicable for Plot/Land"
                : undefined
            }
          >
            <option value="All">All</option>
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Area */}
          <div className="mb-3">
            <div className="text-sm mb-1 font-semibold flex items-center gap-2"><Maximize2 className="w-4 h-4"/>Area (sq.ft)</div>
            <Slider
              range
              min={0}
              max={MAX_AREA}
              step={100}
              value={[filters.areaMin ?? 0, filters.areaMax ?? MAX_AREA]}
              onChange={(v) =>
                handleAreaSliderChange(Array.isArray(v) ? v : [v, v])
              }
              trackStyle={[{ backgroundColor: SLIDER_COLOR }]}
              handleStyle={[
                { borderColor: SLIDER_COLOR },
                { borderColor: SLIDER_COLOR },
              ]}
              railStyle={{ backgroundColor: "#e5e7eb" }}
            />
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                min={0}
                max={MAX_AREA}
                value={filters.areaMin ?? ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? null : Number(e.target.value);
                  updateAreaMin(val);
                }}
                className="w-1/2 border rounded p-2 mr-2"
                placeholder="Min"
              />
              <input
                type="number"
                min={0}
                max={MAX_AREA}
                value={filters.areaMax ?? ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? null : Number(e.target.value);
                  updateAreaMax(val);
                }}
                className="w-1/2 border rounded p-2"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Age */}
          <div className="mb-3">
            <div className="text-sm mb-1 font-semibold flex items-center gap-2"><History className="w-4 h-4"/>Age of property</div>
            <div className="grid grid-cols-2 gap-1">
              {AGE_OPTIONS.map((a) => (
                <label key={a} className="text-xs">
                  <input
                    type="checkbox"
                    checked={filters.ageRanges.includes(a)}
                    onChange={() => toggleAge(a)}
                    className="mr-2"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-4">
            <button
              onClick={apply}
              className="w-full bg-themeOrange text-white py-2 rounded flex items-center justify-center gap-2 transition delay-150 duration-300 ease-in-out hover: hover:scale-105"
            >
              <Search className="w-4 h-4"/> Apply
            </button>
            <button
              onClick={reset}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded mt-2 flex items-center justify-center gap-2 transition delay-150 duration-300 ease-in-out hover: hover:scale-105"
            >
              <RotateCw className="w-4 h-4"/> Reset Filters
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default FilterSidebar;
