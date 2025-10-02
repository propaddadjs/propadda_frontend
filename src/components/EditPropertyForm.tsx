// src/components/EditPropertyForm.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddressSelector from "./AddressSelector";
import MediaUploader, { type SavedMeta } from "./MediaUploader";
import AmenitiesPanel from "./AmenitiesPanel";
import { Loader2, CheckCircle2, XCircle, BadgeCheck, Bath, BatteryCharging, BedDouble, BookMarked, Briefcase, Building2, CalendarCheck, CalendarRange, Car, CarFront, ChevronsUpDown, Compass, ConciergeBell, DoorClosed, Edit, FileText, History, Home, Images, IndianRupee, Layers, LockIcon, MapPin, Maximize2, PanelsTopLeft, Projector, RotateCw, Shapes, Shield, SoapDispenserDroplet, Sofa, TagIcon, TrendingUp, Users, Video, Wrench } from "lucide-react";

// ---------- Shared styling (same as create page) ----------
const INPUT_CLASS =
  "w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-themeOrange/40 focus:border-themeOrange/60 transition-shadow duration-200 shadow-sm";
const SELECT_CLASS = INPUT_CLASS;
const TEXTAREA_CLASS =
  "w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-themeOrange/40 focus:border-themeOrange/60 transition-shadow duration-200 shadow-sm";
const SOFT_BTN_HOVER = "transition-transform duration-150 hover:-translate-y-0.5";

// ---------- Types ----------
export type PropertyCategory = "Residential" | "Commercial";

export type PropertyFormData = {
  // Non-editable in Edit form (but needed in payload)
  preference: string;
  propertyType: string;

  // Editable
  title: string;
  description: string;
  price: number;
  area: number;

  state: string;
  city: string;
  locality: string;
  address?: string;
  pincode?: number;
  nearbyPlace?: string;

  maintenance?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: "Unfurnished" | "Semi-furnished" | "Fully-furnished";
  facing?: string;
  age?: string;
  availability?: string;
  possessionBy?: string | null;
  floor?: number;
  totalFloors?: number;
  reraNumber?: string;
  balconies?: number;
  powerBackup?: "None" | "Partial" | "Full";
  securityDeposit?: number;
  coveredParking?: number | null;
  openParking?: number | null;

  // Commercial only extras (some hidden per conditions)
  cabins?: number;
  meetingRoom?: boolean;
  washroom?: boolean;
  conferenceRoom?: boolean;
  receptionArea?: boolean;
  lift?: boolean;
  parking?: boolean;
  lockIn?: number;
  yearlyIncrease?: number;

  commercialOwnerId?: number;
  residentialOwnerId?: number;

  // Amenity booleans, etc. (same set you used on create)
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
};

type FilesPayload = {
  video: File | null;
  images: File[];
  brochure: File | null;
};

type ExistingMedia = {
  images: string[];
  video?: string;
  brochure?: string;
};

type SavedMetaState = SavedMeta[];

type EditPropertyFormProps = {
  agentId: number;
  listingId: number;
  category: PropertyCategory; // immutable
  initialData: PropertyFormData;
  existingMedia: ExistingMedia; // from server (names)
  apiBase: string;
};

// ---------- Utils ----------
function numberToIndianWords(amount: number): string {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const getTwoDigitWords = (num: number): string => {
    if (num < 20) return units[num];
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return `${tens[ten]}${unit ? " " + units[unit] : ""}`;
  };

  const recurse = (n: number): string => numberToIndianWords(n); // for clarity

  const parts: string[] = [];
  const crore = Math.floor(amount / 1_00_00_000);
  amount %= 1_00_00_000;
  const lakh = Math.floor(amount / 1_00_000);
  amount %= 1_00_000;
  const thousand = Math.floor(amount / 1_000);
  amount %= 1_000;
  const hundred = Math.floor(amount / 100);
  const remainder = amount % 100;

  if (crore > 0) parts.push(`${recurse(crore)} Crore`);
  if (lakh > 0) parts.push(`${recurse(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${recurse(thousand)} Thousand`);
  if (hundred > 0) parts.push(`${recurse(hundred)} Hundred`);
  if (remainder > 0) parts.push(getTwoDigitWords(remainder));
  return parts.join(" ") || "Zero";
}

// ---------- Component ----------
const EditPropertyForm: React.FC<EditPropertyFormProps> = ({
  agentId,
  listingId,
  category,
  initialData,
  existingMedia,
  apiBase,
}) => {
  // Form state
  const [formData, setFormData] = useState<PropertyFormData>(initialData);

  // Price pretty input
  const [priceInput, setPriceInput] = useState<string>(() =>
    initialData.price ? `₹ ${initialData.price.toLocaleString("en-IN")}` : ""
  );

  // Total floors input UX (string)
  const [totalFloorsInput, setTotalFloorsInput] = useState<string>(
    String(initialData.totalFloors ?? 0)
  );

  // Media (replace flow)
  const [replaceMode, setReplaceMode] = useState(false);
  const [, setMediaMeta] = useState<SavedMetaState>([]);
  const [mediaFiles, setMediaFiles] = useState<FilesPayload | null>(null);

const [savingOpen, setSavingOpen] = useState(false);
const [saveStatus, setSaveStatus] = useState<'saving'|'success'|'error'>('saving');
const [saveMsg, setSaveMsg] = useState('We are saving your property details. Please wait…');


  // Derived flags
  const isCommercial = category === "Commercial";
  const isSell = (formData.preference || "").toLowerCase() === "sell";
  const isCommercialPlot = isCommercial && formData.propertyType === "Plot/Land";
  const showFloorsUI = !isCommercialPlot;
  const showAvailability = isSell && !isCommercialPlot;
  const showCabins = isCommercial && !isCommercialPlot;

  // Options
  const FURNISHING_OPTIONS = ["Unfurnished", "Semi-furnished", "Fully-furnished"] as const;
  const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"] as const;
  const AGE_OPTIONS = [
    "0-1 Years",
    "1-3 Years",
    "3-5 Years",
    "5-10 Years",
    "10-15 Years",
    "More than 15 years old",
  ] as const;
  const POSSESSION_OPTIONS = [
    "Within 3 Months",
    "Within 6 Months",
    "By 2026",
    "By 2027",
    "By 2028",
    "By 2029",
    "By 2030",
    "By 2031",
    "By 2032",
  ] as const;

  // Handlers
  const onMediaChanged = (meta: SavedMeta[], files?: FilesPayload) => {
    setMediaMeta(meta || []);
    if (files) setMediaFiles(files);
  };

  const getFloorOptions = (totalStr: string) => {
    const total = Math.max(0, Math.min(100, Number(totalStr || 0)));
    const opts: { label: string; value: number }[] = [
      { label: "All", value: -999 },
      { label: "Basement", value: -2 },
      { label: "Lower Ground", value: -1 },
      { label: "Ground", value: 0 },
    ];
    for (let i = 1; i <= total; i++) opts.push({ label: String(i), value: i });
    return opts;
  };

  const increment = (field: "bedrooms" | "bathrooms") =>
    setFormData((p) => ({ ...p, [field]: Math.max(0, (p[field] || 0) + 1) }));
  const decrement = (field: "bedrooms" | "bathrooms") =>
    setFormData((p) => ({ ...p, [field]: Math.max(0, (p[field] || 0) - 1) }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;
    if (type === "checkbox") newValue = (e.target as HTMLInputElement).checked;
    else if (type === "number") newValue = Number(value);
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // Price formatter
  const formatIndian = (digitsOnly: string) => {
    if (!digitsOnly) return "";
    const n = Number(digitsOnly);
    if (Number.isNaN(n)) return "";
    return n.toLocaleString("en-IN");
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const formatted = digitsOnly ? `₹ ${formatIndian(digitsOnly)}` : "";
    setPriceInput(formatted);
    setFormData((prev) => ({ ...prev, price: digitsOnly ? Number(digitsOnly) : 0 }));
  };

  // Special numeric fields: prevent negative and avoid “appending after 0”
  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, area: digits ? Math.max(0, Number(digits)) : 0 }));
  };
  const handleBalconiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, balconies: digits ? Math.max(0, Number(digits)) : 0 }));
  };
  const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, maintenance: digits ? Number(digits) : 0 }));
  };
  const handleSecurityDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, securityDeposit: digits ? Number(digits) : undefined }));
  };
  const handlePowerBackupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, powerBackup: e.target.value as "None" | "Partial" | "Full" }));
  };

  const handleAddressChange = (changes: {
    state?: string;
    city?: string;
    locality?: string;
    address?: string;
    pincode?: number;
    nearbyPlace?: string;
  }) => setFormData((prev) => ({ ...prev, ...changes }));

  // Effects: keep totalFloors in sync, disable fields on Sell, clear on Commercial Plot
  useEffect(() => {
    const total = Number(totalFloorsInput || 0);
    if (showFloorsUI) {
      if (formData.floor !== undefined && (formData.floor as number) > total) {
        setFormData((prev) => ({ ...prev, floor: total }));
      }
      setFormData((prev) => ({ ...prev, totalFloors: Number(totalFloorsInput || 0) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFloorsInput, showFloorsUI]);

  useEffect(() => {
    if (isSell) {
      setFormData((prev) => ({ ...prev, lockIn: undefined, yearlyIncrease: undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSell]);

  useEffect(() => {
    if (isCommercialPlot) {
      setFormData((prev) => ({
        ...prev,
        totalFloors: undefined,
        floor: undefined,
        availability: undefined,
        possessionBy: null,
        cabins: undefined,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommercialPlot]);

  // Replace media flow
  const handleStartReplace = async () => {
    if (!confirm("This will remove existing media for this listing so you can upload new files. Continue?")) return;

    const url =
      category === "Commercial"
        ? `${apiBase}/commercial-properties/deleteMedia/${listingId}/${agentId}`
        : `${apiBase}/residential-properties/deleteMedia/${listingId}/${agentId}`;

    try {
      await axios.delete(url);
      setReplaceMode(true);
      // clear client copies of existing names (just for UI)
    } catch (e) {
      console.error(e);
      alert("Failed to prepare media replacement. Please try again.");
    }
  };

  const handleCancelReplace = () => {
    setReplaceMode(false);
    setMediaFiles(null);
    setMediaMeta([]);
  };

  // Submit update
  const handleSubmit = async () => {
    // basic validations similar to create
    const missing: string[] = [];
    if (!formData.title?.trim()) missing.push("title");
    if (!formData.description?.trim()) missing.push("description");
    if (!formData.price || formData.price <= 0) missing.push("price");
    if (!formData.area || formData.area <= 0) missing.push("area");
    if (!formData.state?.trim()) missing.push("state");
    if (!formData.city?.trim()) missing.push("city");
    if (!formData.locality?.trim()) missing.push("locality");
    if (!formData.address?.trim()) missing.push("address");
    if (!formData.nearbyPlace?.trim()) missing.push("nearbyPlace");
    if (!formData.pincode || String(formData.pincode).length !== 6) missing.push("pincode");
    if (!isCommercialPlot && (formData.totalFloors === undefined || formData.totalFloors === null))
      missing.push("totalFloors");

    if (showAvailability && formData.availability === "Under Construction" && !formData.possessionBy) {
      missing.push("possession_by");
    }

    if (missing.length) {
      alert("Please fill required fields: " + missing.join(", "));
      return;
    }

    // If replaceMode, enforce media selection (4–8 images, 1 video, 1 brochure)
    if (replaceMode) {
      const imgCount = mediaFiles?.images?.length ?? 0;
      const hasVideo = Boolean(mediaFiles?.video);
      const hasBrochure = Boolean(mediaFiles?.brochure);
      if (imgCount < 4 || imgCount > 8 || !hasVideo || !hasBrochure) {
        alert("Please add 4–8 images, 1 video, and 1 brochure before updating.");
        return;
      }
    }

    setSavingOpen(true);
    setSaveStatus('saving');
    setSaveMsg('We are saving your property details. Please wait…');

    const HARD_CODED_USER_ID = 2;

    const payload: PropertyFormData & {
      listingId: number;
      category: PropertyCategory;
    } = {
      listingId,
      category,
      ...formData,
      preference: initialData.preference,
      propertyType: initialData.propertyType,
    };

    // inject owner id based on category
    if (category.toLowerCase() === "commercial") {
      (payload as any).commercialOwnerId = HARD_CODED_USER_ID;
    } else {
      (payload as any).residentialOwnerId = HARD_CODED_USER_ID;
    }

    // const payload = { listingId, category,  ...formData, preference: initialData.preference, propertyType: initialData.propertyType };
    const navigate = useNavigate();
    const url =
      category === "Commercial"
        ? `${apiBase}/commercial-properties/update/${agentId}`
        : `${apiBase}/residential-properties/update/${agentId}`;

    try {
      const form = new FormData();
      const propertyBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      form.append("property", propertyBlob);

      if (replaceMode && mediaFiles) {
        if (mediaFiles.video) form.append("files", mediaFiles.video as Blob, mediaFiles.video?.name);
        for (const img of mediaFiles.images ?? []) form.append("files", img, img.name);
        if (mediaFiles.brochure) form.append("files", mediaFiles.brochure as Blob, mediaFiles.brochure?.name);
      } else {
        // No new media selected; backend expects files part. Most Spring setups allow empty list.
        // If your backend *requires* at least one, you can append an empty Blob as a safeguard.
        // form.append("files", new Blob([], { type: "application/octet-stream" }), "empty");
      }

      const resp = await axios.put(url, form, { headers: { Accept: "application/json" } });
      console.log("Update response:", resp.data);
      // alert("Property updated successfully.");
      // setReplaceMode(false);
      setSaveStatus('success');
      setSaveMsg('Your property was submitted to Admin for approval.');
      setTimeout(() => {
          navigate('/agent/listings/pending', { replace: true });
        }, 2000);
    } catch (err) {
      console.error("Update error:", err);
      // alert("Failed to update property. See console.");
      setSaveStatus('error');
      setSaveMsg(`Failed to submit property. Please try again. listing id is ${listingId}`);
    }
  };

  // --------- Render ---------
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 bg-white p-6 sm:p-8 shadow-lg rounded-lg mt-2">
         <div className="flex justify-center">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-[#ffe9df] border border-orange-100 p-5">
        
        <h2 className="text-xl font-bold text-gray-800 flex gap-3">
          <Edit className="w-8 h-8 text-orange-600" /> EDIT PROPERTY</h2>
        </div>
        </div>
        
      {/* Header badges (non-editable) */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2">
          {category === "residential" ? <Home className="w-4 h-4 text-themeOrange" /> : <Building2 className="w-4 h-4 text-themeOrange" />}
          <span className="text-sm text-gray-700 font-medium capitalize">Category:</span>
          <span className="text-sm font-semibold">{category}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2">
          <Layers className="w-4 h-4 text-themeOrange" />
          <span className="text-sm text-gray-700 font-medium">Property Type:</span>
          <span className="text-sm font-semibold">{initialData.propertyType}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded px-3 py-2">
          <FileSpreadsheet className="w-4 h-4 text-themeOrange" />
          <span className="text-sm text-gray-700 font-medium">Preference:</span>
          <span className="text-sm font-semibold">{initialData.preference}</span>
        </div>
      </div> */}

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        {/* Badge 1: Category */}
        <div className="flex justify-center items-center gap-2 bg-orange-50 rounded-xl px-4 py-2.5 border border-orange-200">
            {category === "Residential" 
                ? <Home className="w-5 h-5 text-orange-900" /> 
                : <Building2 className="w-5 h-5 text-orange-900" />}
            
            <span className="text-lg text-orange-800 font-medium capitalize">
            Category:
            </span>
            <span className="text-xl text-orange-900 font-bold">
            {category}
            </span>
        </div>

        {/* Badge 2: Property Type */}
        <div className="flex justify-center items-center gap-2 bg-orange-50 rounded-xl px-4 py-2.5 border border-orange-200">
            <Shapes className="w-5 h-5 text-orange-900" />
            
            <span className="text-lg text-orange-800 font-medium">
            Property Type:
            </span>
            <span className="text-xl text-orange-900 font-bold">
            {initialData.propertyType}
            </span>
        </div>

        {/* Badge 3: Preference */}
        <div className="flex justify-center items-center gap-2 bg-orange-50 rounded-xl px-4 py-2.5 border border-orange-200">
            <TagIcon className="w-5 h-5 text-orange-900" />
            
            <span className="text-lg text-orange-800 font-medium">
            Preference:
            </span>
            <span className="text-xl text-orange-900 font-bold">
            {initialData.preference}
            </span>
        </div>

    </div>

      {/* Title & Description */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex block text-sm font-medium mb-2">
            <BookMarked className="w-4 h-4 text-orange-500 mr-1" />
            Property Name/Title<span className="text-red-500">*</span></label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className={INPUT_CLASS} placeholder="Enter Title" />
        </div>
        <div>
          <label className="flex block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 text-orange-500 mr-1" />
            Description<span className="text-red-500">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={TEXTAREA_CLASS}
            rows={3}
            placeholder="Enter Description"
          />
        </div>
      </div>

      {/* Floors block (hidden for Commercial Plot/Land) */}
      {showFloorsUI && (
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <label className="flex block text-sm font-medium mb-2">
                <Layers className="w-4 h-4 text-orange-500 mr-1" />
                Total Floors<span className="text-red-500">*</span></label>
            <input
              type="number"
              min={0}
              max={500}
              value={totalFloorsInput}
              onChange={(e) => setTotalFloorsInput(e.target.value.replace(/\D/g, ""))}
              className={INPUT_CLASS}
              placeholder="Enter total floors"
            />
          </div>
          <div className="flex-1">
            <label className="flex block text-sm font-medium mb-2">
                <DoorClosed className="w-4 h-4 text-orange-500 mr-1" />
                Select Floor</label>
            <select
              name="floor"
              value={String(formData.floor ?? "")}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFormData((prev) => ({ ...prev, floor: Number.isNaN(v) ? prev.floor : v }));
              }}
              className={SELECT_CLASS}
            >
              {getFloorOptions(totalFloorsInput).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Residential-only quick fields */}
      {category === "Residential" && (
        <div className="space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Wrench className="w-4 h-4 text-orange-500 mr-1" />
                Maintenance (₹)</label>
              <input
                type="text"
                name="maintenance"
                value={formData.maintenance ?? ""}
                onChange={handleMaintenanceChange}
                className={INPUT_CLASS}
                placeholder="Enter maintenance in Rs"
              />
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <BedDouble className="w-4 h-4 text-orange-500 mr-1" />
                Bedrooms<span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => decrement("bedrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">-</button>
                <div className="px-4">{formData.bedrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bedrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">+</button>
              </div>
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Bath className="w-4 h-4 text-orange-500 mr-1" />
                Bathrooms<span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => decrement("bathrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">-</button>
                <div className="px-4">{formData.bathrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bathrooms")} className="px-3 py-1 bg-orange-500 text-white rounded">+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Sofa className="w-4 h-4 text-orange-500 mr-1" />
                Furnishing<span className="text-red-500">*</span></label>
              <select name="furnishing" value={formData.furnishing} onChange={handleChange} className={SELECT_CLASS}>
                {FURNISHING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Compass className="w-4 h-4 text-orange-500 mr-1" />
                Facing<span className="text-red-500">*</span></label>
              <select name="facing" value={formData.facing} onChange={handleChange} className={SELECT_CLASS}>
                {FACING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <BadgeCheck className="w-4 h-4 text-orange-500 mr-1" />
                RERA Number</label>
              <input
                type="text"
                name="reraNumber"
                value={formData.reraNumber ?? ""}
                onChange={handleChange}
                className={INPUT_CLASS}
                placeholder="Enter RERA Number (if any)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <PanelsTopLeft className="w-4 h-4 text-orange-500 mr-1" />
                Number of Balconies</label>
              <input
                type="number"
                name="balconies"
                value={formData.balconies ?? 0}
                onChange={handleBalconiesChange}
                className={INPUT_CLASS}
                placeholder="Enter number of balconies"
                min={0}
              />
            </div>

            {/* Reserved Parking */}
            <div className="md:col-span-2">
              <label className="flex text-sm font-medium mb-2">
                <Car className="w-4 h-4 text-orange-500 mr-1" />
                Reserved Parking <span className="text-sm text-gray-400 ml-1 italic">(Optional)</span></label>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-700">Covered Parking</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Math.max(0, Number(prev.coveredParking ?? 0) - 1) }))}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                    >
                      −
                    </button>
                    <div className="w-8 text-center text-sm">{formData.coveredParking ?? 0}</div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Number(prev.coveredParking ?? 0) + 1 }))}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-700">Open Parking</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, openParking: Math.max(0, Number(prev.openParking ?? 0) - 1) }))}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                    >
                      −
                    </button>
                    <div className="w-8 text-center text-sm">{formData.openParking ?? 0}</div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, openParking: Number(prev.openParking ?? 0) + 1 }))}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="flex block text-sm font-medium mb-2">
                <BatteryCharging className="w-4 h-4 text-orange-500 mr-1" />
                Power Backup</label>
              <select name="powerBackup" value={formData.powerBackup} onChange={handlePowerBackupChange} className={SELECT_CLASS}>
                <option value="None">None</option>
                <option value="Partial">Partial</option>
                <option value="Full">Full</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Shared: Price, Area, Age, Availability/SecurityDeposit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="flex block text-sm font-medium mb-2">
            <IndianRupee className="w-4 h-4 text-orange-500 mr-1" />
            Price in ₹<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="price"
            value={priceInput}
            onChange={handlePriceChange}
            className={INPUT_CLASS}
            placeholder="₹ Expected Price"
          />
          <p className="mt-2 text-gray-600 italic">
            {formData.price > 0 ? `₹ ${formData.price.toLocaleString("en-IN")} (${numberToIndianWords(formData.price)} only)` : ""}
          </p>
        </div>

        <div>
          <label className="flex block text-sm font-medium mb-2">
            <Maximize2 className="w-4 h-4 text-orange-500 mr-1" />
            Area (sq.ft)<span className="text-red-500">*</span></label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleAreaChange}
            className={INPUT_CLASS}
            placeholder="Enter Area"
            min={0}
          />
        </div>

        <div>
          <label className="flex block text-sm font-medium mb-2">
            <History className="w-4 h-4 text-orange-500 mr-1" />
            Age<span className="text-red-500">*</span></label>
          <select name="age" value={formData.age} onChange={handleChange} className={SELECT_CLASS}>
            {AGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          {showAvailability && (
            <>
              <label className="flex block text-sm font-medium mb-2">
                <CalendarCheck className="w-4 h-4 text-orange-500 mr-1" />
                Availability</label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className={SELECT_CLASS}
              >
                <option value="Ready to move">Ready to move</option>
                <option value="Under Construction">Under Construction</option>
              </select>
              {formData.availability === "Under Construction" && (
                <div className="mt-3">
                  <label className="flex block text-sm font-medium mb-1">
                    <CalendarRange className="w-4 h-4 text-orange-500 mr-1" />
                    Possession By</label>
                  <select
                    name="possessionBy"
                    value={formData.possessionBy ?? ""}
                    onChange={handleChange}
                    className={SELECT_CLASS}
                  >
                    <option value="">-- Select Possession --</option>
                    {POSSESSION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {!isSell && (
            <div className="mt-3">
              <label className="flex block text-sm font-medium mb-2">
                <Shield className="w-4 h-4 text-orange-500 mr-1" />
                Security Deposit (optional)</label>
              <input
                type="text"
                name="securityDeposit"
                value={formData.securityDeposit ?? ""}
                onChange={handleSecurityDepositChange}
                className={INPUT_CLASS}
                placeholder="Enter security deposit (optional)"
              />
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-themeOrange" />
          Address<span className="text-red-500">*</span>
        </label>
        <AddressSelector
          stateValue={String(formData.state || "")}
          cityValue={String(formData.city || "")}
          localityValue={String(formData.locality || "")}
          onChange={handleAddressChange}
        />
      </div>

      {/* Media */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Images className="w-4 h-4 text-themeOrange" />
            <h3 className="text-lg font-semibold">Media</h3>
          </div>
          {!replaceMode ? (
            <button
              type="button"
              onClick={handleStartReplace}
              className={`px-3 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 ${SOFT_BTN_HOVER}`}
            >
              <span className="inline-flex items-center gap-2">
                <RotateCw className="w-4 h-4" /> Replace Media
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelReplace}
              className={`px-3 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 ${SOFT_BTN_HOVER}`}
            >
              Cancel Replace
            </button>
          )}
        </div>

        {!replaceMode ? (
          <div className="space-y-2">
            {/* Names only (as received) */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Images className="w-4 h-4" />
              <span className="font-medium">Images:</span>
              <span className="truncate">
                {existingMedia.images.length ? existingMedia.images.join(", ") : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Video className="w-4 h-4" />
              <span className="font-medium">Video:</span>
              <span>{existingMedia.video ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Brochure:</span>
              <span>{existingMedia.brochure ?? "—"}</span>
            </div>
          </div>
        ) : (
          <MediaUploader onChanged={onMediaChanged} />
        )}
      </div>

      {/* Commercial-only details */}
      {category === "Commercial" && (
        <div className="space-y-4 mb-8">
          {showCabins && (
            <div>
              <label className="flex block text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 text-orange-500 mr-1" />
                Cabins</label>
              <input
                type="number"
                name="cabins"
                value={formData.cabins ?? 0}
                onChange={handleChange}
                className={INPUT_CLASS}
                min={0}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <label><input type="checkbox" name="meetingRoom" checked={formData.meetingRoom || false} onChange={handleChange} /> Meeting Room <Users className="w-4 h-4 text-orange-500" /> </label>
            <label><input type="checkbox" name="conferenceRoom" checked={formData.conferenceRoom || false} onChange={handleChange} /> Conference Room <Projector className="w-4 h-4 text-orange-500" /> </label>
            <label><input type="checkbox" name="receptionArea" checked={formData.receptionArea || false} onChange={handleChange} /> Reception Area <ConciergeBell className="w-4 h-4 text-orange-500" /> </label>
            <label><input type="checkbox" name="washroom" checked={formData.washroom || false} onChange={handleChange} /> Washroom <SoapDispenserDroplet className="w-4 h-4 text-orange-500" /> </label>
            <label><input type="checkbox" name="lift" checked={formData.lift || false} onChange={handleChange} /> Lift <ChevronsUpDown className="w-4 h-4 text-orange-500" /> </label>
            <label><input type="checkbox" name="parking" checked={formData.parking || false} onChange={handleChange} /> Parking <CarFront className="w-4 h-4 text-orange-500" /> </label>
          </div>

          <div>
            <label className="flex block text-sm font-medium mb-2">
                <LockIcon className="w-4 h-4 text-orange-500 mr-1" />
                Lock-in (months)</label>
            <input
              type="number"
              name="lockIn"
              value={formData.lockIn ?? 0}
              onChange={handleChange}
              disabled={isSell}
              className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`}
              min={0}
            />
          </div>
          <div>
            <label className="flex block text-sm font-medium mb-2">
                <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                Yearly Increase (%)</label>
            <input
              type="number"
              name="yearlyIncrease"
              value={formData.yearlyIncrease ?? 0}
              onChange={handleChange}
              disabled={isSell}
              className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`}
              min={0}
            />
          </div>
        </div>
      )}

      {/* Amenities (same component) */}
      {category !== "Commercial" && (
        <AmenitiesPanel formData={formData as any} setFormData={setFormData as any} />
      )}

      {/* Actions */}
      <div className="flex items-end gap-4 mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          className={`w-full bg-themeOrange text-white font-bold py-3 rounded hover:bg-hoverOrange focus:outline-none ${SOFT_BTN_HOVER}`}
        >
          UPDATE PROPERTY
        </button>
      </div>
      {savingOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
      <div className="flex items-center gap-3">
        {saveStatus === 'saving' && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        )}
        {saveStatus === 'success' && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900">
            {saveStatus === 'saving' ? 'Saving Property' : saveStatus === 'success' ? 'Submitted' : 'Submission Failed'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{saveMsg}</p>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        {saveStatus !== 'saving' ? (
          <button
            type="button"
            onClick={() => setSavingOpen(false)}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
          >
            Close
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 cursor-not-allowed"
          >
            Please wait…
          </button>
        )}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default EditPropertyForm;
