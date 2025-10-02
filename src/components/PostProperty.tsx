import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddressSelector from "./AddressSelector";
import MediaUploader, { type SavedMeta } from "./MediaUploader";
import AmenitiesPanel from "./AmenitiesPanel";
import { Loader2, CheckCircle2, XCircle, BadgeCheck, Bath, BatteryCharging, BedDouble, BookMarked, Briefcase, Building, CalendarCheck, CalendarRange, Car, CarFront, ChevronsUpDown, Compass, ConciergeBell, DoorClosed, FileText, History, HousePlus, IndianRupee, Layers, LockIcon, MapPin, Maximize2, PanelsTopLeft, Projector, Shield, SoapDispenserDroplet, Sofa, TagIcon, TrendingUp, Users, Wrench } from "lucide-react";

// ---------------- Types ----------------
type PropertyCategory = "residential" | "commercial";

interface FormData {
  preference: string;
  propertyType: string; // subtype like 'Flat', 'Villa', 'Office', 'Plot/Land', etc.
  state: string;
  city: string;
  locality: string;
  title: string;
  description: string;
  price: number;
  area: number;
  maintenance?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: "Unfurnished" | "Semi-furnished" | "Fully-furnished";
  facing?: string;
  age?: string;
  availability?: string;
  possessionBy?: string | null;
  floor?: number;
  reraNumber?: string;
  totalFloors?: number;
  balconies?: number;
  powerBackup?: "None" | "Partial" | "Full";
  pincode?: number;
  address?: string;
  nearbyPlace?: string;
  securityDeposit?: number;
  coveredParking?: number | null;
  openParking?: number | null;
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
  // Amenities (residential)
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
  // Other rooms
  poojaRoom?: boolean;
  studyRoom?: boolean;
  servantRoom?: boolean;
  storeRoom?: boolean;
  // Extra property features
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
  // Society/building features
  fitnessCenter?: boolean;
  swimmingPool?: boolean;
  clubhouseCommunityCenter?: boolean;
  securityPersonnel?: boolean;
  lifts?: boolean;
  // Additional features
  separateEntryForServantRoom?: boolean;
  noOpenDrainageAround?: boolean;
  bankAttachedProperty?: boolean;
  lowDensitySociety?: boolean;
  // Water source
  municipalCorporation?: boolean;
  borewellTank?: boolean;
  water24x7?: boolean;
  // Overlooking
  overlookingPool?: boolean;
  overlookingParkGarden?: boolean;
  overlookingClub?: boolean;
  overlookingMainRoad?: boolean;
  // Other features
  inGatedSociety?: boolean;
  cornerProperty?: boolean;
  petFriendlySociety?: boolean;
  wheelchairFriendly?: boolean;
  // Location advantages
  closeToMetroStation?: boolean;
  closeToSchool?: boolean;
  closeToHospital?: boolean;
  closeToMarket?: boolean;
  closeToRailwayStation?: boolean;
  closeToAirport?: boolean;
  closeToMall?: boolean;
  closeToHighway?: boolean;
}

// ---------------- Utilities ----------------
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

  const parts: string[] = [];
  const crore = Math.floor(amount / 1_00_00_000);
  amount %= 1_00_00_000;
  const lakh = Math.floor(amount / 1_00_000);
  amount %= 1_00_000;
  const thousand = Math.floor(amount / 1_000);
  amount %= 1_000;
  const hundred = Math.floor(amount / 100);
  const remainder = amount % 100;

  if (crore > 0) parts.push(`${numberToIndianWords(crore)} Crore`);
  if (lakh > 0) parts.push(`${numberToIndianWords(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${numberToIndianWords(thousand)} Thousand`);
  if (hundred > 0) parts.push(`${numberToIndianWords(hundred)} Hundred`);
  if (remainder > 0) parts.push(getTwoDigitWords(remainder));
  return parts.join(" ") || "Zero";
}

const RESIDENTIAL_SUBTYPES = ["Flat", "House", "Villa", "Apartment"] as const;
const COMMERCIAL_SUBTYPES = ["Office", "Plot/Land", "Storage/Warehouse"] as const;

type FilesPayload = {
  video: File | null;
  images: File[];
  brochure: File | null;
};
// --- UI helpers (white fields + focus rings + soft shadow) ---
const INPUT_CLASS =
  "w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-themeOrange/40 focus:border-themeOrange/60 transition-shadow duration-200 shadow-sm";
const SELECT_CLASS = INPUT_CLASS;
const TEXTAREA_CLASS =
  "w-full bg-white border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-themeOrange/40 focus:border-themeOrange/60 transition-shadow duration-200 shadow-sm";

// Optional soft motion on buttons
// const SOFT_BTN_HOVER = "transition-transform duration-150 hover:-translate-y-0.5";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

// Compact, consistent section wrappers
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <section className={`rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-5 md:p-6 shadow-sm ${className || ""}`}>
    <h3 className="text-base md:text-lg font-semibold mb-4 text-gray-900">{title}</h3>
    {children}
  </section>
);

const Row: React.FC<{
  children: React.ReactNode;
  cols?: number;
  className?: string;   // ✅ allow className
}> = ({ children, cols = 2, className }) => (
  <div
    className={[
      "grid gap-4 md:gap-6",
      cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "",
      className || "",
    ].join(" ")}
  >
    {children}
  </div>
);

// const toNonNegativeInt = (s: string) => {
//   const digits = s.replace(/\D/g, "");
//   return digits ? Math.max(0, parseInt(digits, 10)) : 0;
// };


// ---------------- Component ----------------
const PropertyForm: React.FC = () => {
  const [category, setCategory] = useState<PropertyCategory>("residential");
  const [mediaMeta, setMediaMeta] = useState<SavedMeta[]>([]);
  const [mediaFiles, setMediaFiles] = useState<FilesPayload | null>(null);
  // const [, setResetKey] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    preference: "Sale",
    propertyType: "",
    state: "",
    city: "",
    locality: "",
    title: "",
    description: "",
    price: 0,
    area: 0,
    maintenance: 0,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "Unfurnished",
    facing: "North",
    age: "0-1 Years",
    availability: "Ready to move",
    possessionBy: null,
    floor: 0,
    reraNumber: "",
    totalFloors: 0,
    balconies: 0,
    powerBackup: "None",
    pincode: undefined,
    address: "",
    nearbyPlace: "",
    securityDeposit: undefined,
    coveredParking: 0,
    openParking: 0,
    centerCooling: false,
    fireAlarm: false,
    heating: false,
    gym: false,
    modularKitchen: false,
    pool: false,
    elevator: false,
    petFriendly: false,
    storage: false,
    laundry: false,
    dishwasher: false,
    dryer: false,
    sauna: false,
    emergencyExit: false,
    waterPurifier: false,
    gasPipeline: false,
    park: false,
    vastuCompliant: false,
    rainWaterHarvesting: false,
    maintenanceStaff: false,
    poojaRoom: false,
    studyRoom: false,
    servantRoom: false,
    storeRoom: false,
    highCeilingHeight: false,
    falseCeilingLighting: false,
    internetConnectivity: false,
    centrallyAirConditioned: false,
    securityFireAlarm: false,
    recentlyRenovated: false,
    privateGardenTerrace: false,
    naturalLight: false,
    airyRooms: false,
    intercomFacility: false,
    spaciousInteriors: false,
    fitnessCenter: false,
    swimmingPool: false,
    clubhouseCommunityCenter: false,
    securityPersonnel: false,
    lifts: false,
    separateEntryForServantRoom: false,
    noOpenDrainageAround: false,
    bankAttachedProperty: false,
    lowDensitySociety: false,
    municipalCorporation: false,
    borewellTank: false,
    water24x7: false,
    overlookingPool: false,
    overlookingParkGarden: false,
    overlookingClub: false,
    overlookingMainRoad: false,
    inGatedSociety: false,
    cornerProperty: false,
    petFriendlySociety: false,
    wheelchairFriendly: false,
    closeToMetroStation: false,
    closeToSchool: false,
    closeToHospital: false,
    closeToMarket: false,
    closeToRailwayStation: false,
    closeToAirport: false,
    closeToMall: false,
    closeToHighway: false,
  });

  const INITIAL_FORM: FormData = {
  preference: "Sale",
  propertyType: "",
  state: "",
  city: "",
  locality: "",
  title: "",
  description: "",
  price: 0,
  area: 0,
  maintenance: 0,
  bedrooms: 1,
  bathrooms: 1,
  furnishing: "Unfurnished",
    facing: "North",
    age: "0-1 Years",
    availability: "Ready to move",
    possessionBy: null,
    floor: 0,
    reraNumber: "",
    totalFloors: 0,
    balconies: 0,
    powerBackup: "None",
    pincode: undefined,
    address: "",
    nearbyPlace: "",
    securityDeposit: undefined,
    coveredParking: 0,
    openParking: 0,
    centerCooling: false,
    fireAlarm: false,
    heating: false,
    gym: false,
    modularKitchen: false,
    pool: false,
    elevator: false,
    petFriendly: false,
    storage: false,
    laundry: false,
    dishwasher: false,
    dryer: false,
    sauna: false,
    emergencyExit: false,
    waterPurifier: false,
    gasPipeline: false,
    park: false,
    vastuCompliant: false,
    rainWaterHarvesting: false,
    maintenanceStaff: false,
    poojaRoom: false,
    studyRoom: false,
    servantRoom: false,
    storeRoom: false,
    highCeilingHeight: false,
    falseCeilingLighting: false,
    internetConnectivity: false,
    centrallyAirConditioned: false,
    securityFireAlarm: false,
    recentlyRenovated: false,
    privateGardenTerrace: false,
    naturalLight: false,
    airyRooms: false,
    intercomFacility: false,
    spaciousInteriors: false,
    fitnessCenter: false,
    swimmingPool: false,
    clubhouseCommunityCenter: false,
    securityPersonnel: false,
    lifts: false,
    separateEntryForServantRoom: false,
    noOpenDrainageAround: false,
    bankAttachedProperty: false,
    lowDensitySociety: false,
    municipalCorporation: false,
    borewellTank: false,
    water24x7: false,
    overlookingPool: false,
    overlookingParkGarden: false,
    overlookingClub: false,
    overlookingMainRoad: false,
    inGatedSociety: false,
    cornerProperty: false,
    petFriendlySociety: false,
    wheelchairFriendly: false,
    closeToMetroStation: false,
    closeToSchool: false,
    closeToHospital: false,
    closeToMarket: false,
    closeToRailwayStation: false,
    closeToAirport: false,
    closeToMall: false,
    closeToHighway: false,
};

// Keep the UI intact; just centralize the switch+reset logic
const handleSwitchCategory = (next: PropertyCategory) => {
  if (category === next) return; // no-op if already on the same tab
  setCategory(next);
  setFormData({ ...INITIAL_FORM, propertyType: "" });
  setTotalFloorsInput("0");
  setPriceInput("");
  // (Optional) if you want a complete reset of media too, uncomment:
  setMediaFiles({ images: [], video: null, brochure: null });
  setMediaMeta([]);
  setMediaKey((k) => k + 1);   // ← force remount
  setAddressKey((k) => k + 1); 
};

  const onMediaChanged = (meta: SavedMeta[], files?: FilesPayload) => {
  // update meta only if different
  setMediaMeta((prev) => {
    const same =
      prev.length === meta.length &&
      prev.every((m, i) => m.name === meta[i].name && m.size === meta[i].size && m.mediaType === meta[i].mediaType);
    return same ? prev : meta;
  });

  if (files) {
    setMediaFiles((prev) => {
      const same =
        prev?.video === files.video &&
        prev?.brochure === files.brochure &&
        prev?.images?.length === files.images.length &&
        prev?.images?.every((f, i) => f === files.images[i]);
      return same ? prev : files;
    });
  }
};

const [savingOpen, setSavingOpen] = useState(false);
const [saveStatus, setSaveStatus] = useState<'saving'|'success'|'error'>('saving');
const [saveMsg, setSaveMsg] = useState('We are saving your property details. Please wait…');


  // -------------- Derived UI flags --------------
  const isCommercial = category === "commercial";
  const isSell = (formData.preference || "").toLowerCase() === "sale";
  const isCommercialPlot = isCommercial && formData.propertyType === "Plot/Land";
  const showFloorsUI = !isCommercialPlot; // (1) Hide floors when Commercial + Plot/Land
  const showAvailability = isSell && !isCommercialPlot; // (1) Hide availability when Commercial + Plot/Land
  const showCabins = isCommercial && !isCommercialPlot; // (1) Hide cabins when Commercial + Plot/Land

  // Furnishing/facing/age options
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

  // Local UI-only state
  const [totalFloorsInput, setTotalFloorsInput] = useState<string>("0");
  const [addressKey, setAddressKey] = useState(0);
  const [mediaKey, setMediaKey] = useState(0);

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

  // Counters
  const increment = (field: "bedrooms" | "bathrooms") => setFormData((p) => ({ ...p, [field]: (p[field] || 0) + 1 }));
  const decrement = (field: "bedrooms" | "bathrooms") => setFormData((p) => ({ ...p, [field]: Math.max(0, (p[field] || 0) - 1) }));

  // Controlled inputs handlers
  const handleMaintenanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, maintenance: digitsOnly ? Number(digitsOnly) : 0 }));
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, area: digitsOnly ? Number(digitsOnly) : 0 }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;
    if (type === "checkbox") newValue = (e.target as HTMLInputElement).checked;
    else if (type === "number") newValue = Number(value);
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const formatIndian = (digitsOnly: string) => {
    if (!digitsOnly) return "";
    const n = Number(digitsOnly);
    if (Number.isNaN(n)) return "";
    return n.toLocaleString("en-IN");
  };

  const [priceInput, setPriceInput] = useState<string>("");
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    const formatted = digitsOnly ? `₹ ${formatIndian(digitsOnly)}` : "";
    setPriceInput(formatted);
    setFormData((prev) => ({ ...prev, price: digitsOnly ? Number(digitsOnly) : 0 }));
  };

  const handleBalconiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, balconies: digits ? Number(digits) : 0 }));
  };

  const handlePowerBackupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, powerBackup: e.target.value as "None" | "Partial" | "Full" }));
  };

  const handleSecurityDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, securityDeposit: digits ? Number(digits) : undefined }));
  };

  const handleAddressChange = (changes: {
    state?: string;
    city?: string;
    locality?: string;
    address?: string;
    pincode?: number;
    nearbyPlace?: string;
  }) => setFormData((prev) => ({ ...prev, ...changes }));

  const resetForm = () => {
  // 1) reset top-level toggles
  setCategory("residential");
  setFormData({
    preference: "Sale",
    propertyType: "",
    state: "",
    city: "",
    locality: "",
    title: "",
    description: "",
    price: 0,
    area: 0,
    maintenance: 0,
    bedrooms: 1,
    bathrooms: 1,
    furnishing: "Unfurnished",
    facing: "North",
    age: "0-1 Years",
    availability: "Ready to move",
    possessionBy: null,
    floor: 0,
    reraNumber: "",
    totalFloors: 0,
    balconies: 0,
    powerBackup: "None",
    pincode: undefined,
    address: "",
    nearbyPlace: "",
    securityDeposit: undefined,
    coveredParking: 0,
    openParking: 0,

    // amenities & flags reset
    centerCooling: false,
    fireAlarm: false,
    heating: false,
    gym: false,
    modularKitchen: false,
    pool: false,
    elevator: false,
    petFriendly: false,
    storage: false,
    laundry: false,
    dishwasher: false,
    dryer: false,
    sauna: false,
    emergencyExit: false,
    waterPurifier: false,
    gasPipeline: false,
    park: false,
    vastuCompliant: false,
    rainWaterHarvesting: false,
    maintenanceStaff: false,
    poojaRoom: false,
    studyRoom: false,
    servantRoom: false,
    storeRoom: false,
    highCeilingHeight: false,
    falseCeilingLighting: false,
    internetConnectivity: false,
    centrallyAirConditioned: false,
    securityFireAlarm: false,
    recentlyRenovated: false,
    privateGardenTerrace: false,
    naturalLight: false,
    airyRooms: false,
    intercomFacility: false,
    spaciousInteriors: false,
    fitnessCenter: false,
    swimmingPool: false,
    clubhouseCommunityCenter: false,
    securityPersonnel: false,
    lifts: false,
    separateEntryForServantRoom: false,
    noOpenDrainageAround: false,
    bankAttachedProperty: false,
    lowDensitySociety: false,
    municipalCorporation: false,
    borewellTank: false,
    water24x7: false,
    overlookingPool: false,
    overlookingParkGarden: false,
    overlookingClub: false,
    overlookingMainRoad: false,
    inGatedSociety: false,
    cornerProperty: false,
    petFriendlySociety: false,
    wheelchairFriendly: false,
    closeToMetroStation: false,
    closeToSchool: false,
    closeToHospital: false,
    closeToMarket: false,
    closeToRailwayStation: false,
    closeToAirport: false,
    closeToMall: false,
    closeToHighway: false,
  });

  // 3) reset helpers & media mirrors
  setPriceInput("");
  setTotalFloorsInput("0");
  setMediaMeta([]);
  setMediaFiles({ images: [], video: null, brochure: null });

  // 4) bump the key to remount child components
  // setResetKey((k) => k + 1);
  setMediaKey((k) => k + 1);   // ← force remount
  setAddressKey((k) => k + 1); 
};

  // -------------- Effects --------------
  // keep formData.totalFloors in sync with input (unless hidden by Commercial Plot)
  useEffect(() => {
    const total = Number(totalFloorsInput || 0);
    if (showFloorsUI) {
      if (formData.floor !== undefined && (formData.floor as number) > total) {
        setFormData((prev) => ({ ...prev, floor: total }));
      }
      setFormData((prev) => ({ ...prev, totalFloors: Number(totalFloorsInput || 0) }));
    }
  }, [totalFloorsInput, showFloorsUI]);

  // (2) When preference is Sell, disable & clear Lock-in and Yearly Increase
  useEffect(() => {
    if (isSell) {
      setFormData((prev) => ({ ...prev, lockIn: undefined, yearlyIncrease: undefined }));
    }
  }, [isSell]);

  // (1) When switching to Commercial Plot/Land, clear floors, availability and cabins to avoid validation/post noise
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
  }, [isCommercialPlot]);

  const navigate = useNavigate();

  // -------------- Submit --------------
  const handleSubmit = async () => {
    const isCommercialPlotNow = category === "commercial" && formData.propertyType === "Plot/Land";

    // Required rules (dynamic where applicable)
    const required: { key: keyof FormData | string; dbName: string; validator?: (v: unknown) => boolean }[] = [
      { key: "propertyType", dbName: "property_type", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "preference", dbName: "preference", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "title", dbName: "title", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "description", dbName: "description", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "price", dbName: "price", validator: (v: unknown) => typeof v === "number" && !Number.isNaN(v) && v > 0 },
      { key: "area", dbName: "area", validator: (v: unknown) => typeof v === "number" && !Number.isNaN(v) && v > 0 },
      { key: "state", dbName: "state", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "city", dbName: "city", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "locality", dbName: "locality", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      // totalFloors is mandatory EXCEPT when Commercial Plot/Land
      ...(isCommercialPlotNow
        ? []
        : [{ key: "totalFloors", dbName: "total_floors", validator: (v: unknown) => typeof v === "number" && !Number.isNaN(v) }]),
      { key: "nearbyPlace", dbName: "nearbyPlace", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "address", dbName: "address", validator: (v: unknown) => typeof v === "string" && v.trim().length > 0 },
      { key: "pincode", dbName: "pincode", validator: (v: unknown) => v !== undefined && v !== null && String(v).trim().length === 6 },
      // optional residential extras
      { key: "bedrooms", dbName: "bedrooms", validator: (v: unknown) => v === undefined || (typeof v === "number" && !Number.isNaN(v)) },
      { key: "bathrooms", dbName: "bathrooms", validator: (v: unknown) => v === undefined || (typeof v === "number" && !Number.isNaN(v)) },
      { key: "furnishing", dbName: "furnishing", validator: (v: unknown) => v === undefined || typeof v === "string" },
      { key: "facing", dbName: "facing", validator: (v: unknown) => v === undefined || typeof v === "string" },
      { key: "age", dbName: "age", validator: (v: unknown) => v === undefined || typeof v === "string" },
      // possessionBy required only when availability === 'Under Construction'
      { key: "possessionBy", dbName: "possession_by", validator: (v: unknown) => v === undefined || typeof v === "string" },
      { key: "balconies", dbName: "balconies", validator: (v: unknown) => v === undefined || (typeof v === "number" && !Number.isNaN(v)) },
      { key: "powerBackup", dbName: "power_backup", validator: (v: unknown) => v === undefined || typeof v === "string" },
    ];

    const missing: string[] = [];
    for (const rule of required) {
      const value = (formData as any)[rule.key];
      if (rule.key === "possessionBy") {
        if (formData.availability === "Under Construction") {
          const ok = rule.validator ? rule.validator(value) : value !== undefined && value !== null && String(value).trim() !== "";
          if (!ok) missing.push(rule.dbName);
        }
        continue;
      }
      const ok = rule.validator ? rule.validator(value) : value !== undefined && value !== null && String(value).trim() !== "";
      if (!ok) missing.push(rule.dbName);
    }

    if (missing.length > 0) {
      alert(missing.map((col) => `Please fill the ${col}. It's a mandatory field.`).join("\n"));
      return;
    }

    // if (!mediaFiles || !mediaFiles.video || (mediaFiles.images?.length ?? 0) < 4) {
    //   alert("Please attach 1 video and 4–8 images before submitting.");
    //   return;
    // }

    // --- Media validation: 4-8 images, exactly 1 video, exactly 1 brochure ---
    const imgCount = mediaFiles?.images?.length ?? 0;
    // const hasVideo = Boolean(mediaFiles?.video);
    // const hasBrochure = Boolean(mediaFiles?.brochure);
    if (imgCount < 4 || imgCount > 8) {
      alert("Please add 4–8 images before submitting.");
      return;
    }

    setSavingOpen(true);
    setSaveStatus('saving');
    setSaveMsg('We are saving your property details. Please wait…');

    const HARD_CODED_USER_ID = 2;

    const payload = { ...formData, media: mediaMeta };
    console.log("POST payload:", payload);

    const url = category === "residential" ? `${API_BASE_URL}/residential-properties/add` : `${API_BASE_URL}/commercial-properties/add`;

    if (category.toLowerCase() === "commercial") {
      (payload as any).commercialOwnerId = HARD_CODED_USER_ID;
    } else {
      (payload as any).residentialOwnerId = HARD_CODED_USER_ID;
    }

    try {
      const form = new FormData();
      const propertyBlob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      form.append("property", propertyBlob);
      if (mediaFiles?.video) form.append("files", mediaFiles.video as Blob, mediaFiles.video?.name);
      for (const img of mediaFiles?.images ?? []) form.append("files", img, img.name);
      if (mediaFiles?.brochure) form.append("files", mediaFiles.brochure as Blob, mediaFiles.brochure?.name);

      // debug entries
      // @ts-ignore
      for (const pair of form.entries()) console.log("form entry:", pair[0], pair[1]);

      const resp = await axios.post(url, form, {
        headers: { Accept: "application/json" },
      });

      console.log("Server response:", resp.data);
       setSaveStatus('success');
        setSaveMsg('Your property was submitted to Admin for approval.');
        // optional: brief pause, then go
        setTimeout(() => {
          navigate('/agent/listings/pending', { replace: true });
        }, 2000);
    } catch (err) {
      console.error("Submit error:", err);
      // alert("Failed to submit property. See console.");
      setSaveStatus('error');
    setSaveMsg('Failed to submit property. Please try again.');
    }
  };

  // --- UI helpers ---
// const Card = ({ children }: { children: React.ReactNode }) => (
//   <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 md:p-6" >
//     {children}
//   </div>
// );

// const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
//   <Card>
//     <div className="mb-4 flex items-center justify-between">
//       <h2 className="text-base md:text-lg font-semibold text-gray-800">{title}</h2>
//     </div>
//     {children}
//   </Card>
// );

  const subtypeOptions = category === "residential" ? (RESIDENTIAL_SUBTYPES as readonly string[]) : (COMMERCIAL_SUBTYPES as readonly string[]);

  // ---------------- Render ----------------
  return (
    <div className="w-full mx-auto bg-white p-8 shadow-lg rounded-lg mt-2">
      <div className="flex justify-center">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-[#ffe9df] border border-orange-100 p-5">
        
        <h2 className="text-xl font-bold text-gray-800 flex gap-3">
          <HousePlus className="w-8 h-8 text-orange-600" /> POST PROPERTY</h2>
        </div>
        </div>
      {/* Category */}
      {/* <div className="mb-6 flex space-x-4">
        <button
          type="button"
          className={`flex-1 p-3 rounded font-semibold ${SOFT_BTN_HOVER} ${category === "residential" ? "bg-themeOrange text-white focus:outline-none" : "bg-gray-200 text-gray-800 focus:outline-none"}`}
          onClick={() => {
            setCategory("residential");
            setFormData((prev) => ({ ...prev, propertyType: "" }));
          }}
        >
          Residential
        </button>
        <button
          type="button"
          className={`flex-1 p-3 rounded font-semibold ${SOFT_BTN_HOVER} ${category === "commercial" ? "bg-themeOrange text-white focus:outline-none" : "bg-gray-200 text-gray-800 focus:outline-none"}`}
          onClick={() => {
            setCategory("commercial");
            setFormData((prev) => ({ ...prev, propertyType: "" }));
          }}
        >
          Commercial
        </button>
      </div> */}
      {/* Category (segmented) */}
      <div className="mb-6">
        <div className="relative w-full bg-gray-100 rounded-full p-1 flex">
          {/* animated thumb */} 
          <span
            className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-themeOrange transition-transform duration-300 ${
              category === "commercial" ? "translate-x-full" : "translate-x-0"
            }`}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => handleSwitchCategory("residential")}
            className={`relative z-10 flex-1 py-2 text-sm md:text-base font-medium rounded-full transition-colors ${
              category === "residential" ? "text-white" : "text-gray-700"
            }`}
          >
            Residential
          </button>
          <button
            type="button"
            onClick={() => handleSwitchCategory("commercial")}
            className={`relative z-10 flex-1 py-2 text-sm md:text-base font-medium rounded-full transition-colors ${
              category === "commercial" ? "text-white" : "text-gray-700"
            }`}
          >
            Commercial
          </button>
        </div>
      </div>


      {/* Preference */}
      {/* <div className="mb-6">
        <label className="block text-lg font-medium mb-2">I'm looking for</label>
        <div className="flex space-x-4">
          {(category === "residential" ? ["Rent", "Sell", "PG"] : ["Rent", "Sale"]).map((option) => (
            <button
              key={option}
              type="button"
              className={`px-4 py-2 rounded font-medium ${SOFT_BTN_HOVER} ${formData.preference === option ? "bg-buttonOrange text-black border-themeOrange focus:outline-none" : "bg-gray-200 text-gray-800"}`}
              onClick={() => setFormData((prev) => ({ ...prev, preference: option }))}
            >
              {option}
            </button>
          ))}
        </div>
      </div> */}

      {/* Property Type (subtype) */}
      {/* <div className="mb-6">
        <label className="block text-lg font-medium mb-2">
          Property Type<span style={{ color: "red" }}>*</span>
        </label>
        <select
          name="propertyType"
          value={formData.propertyType}
          onChange={handleChange}
          className={SELECT_CLASS}
        >
          <option value="">{category === "residential" ? "-- Select Residential Type --" : "-- Select Commercial Type --"}</option>
          {subtypeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div> */}

      {/* Title */}
      {/* <div className="mb-6">
        <label className="block text-lg font-medium mb-2">
          Property Name/Title<span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={INPUT_CLASS}
          placeholder="Enter Title"
        />
      </div> */}

      {/* Description */}
      {/* <div className="mb-6">
        <label className="block text-lg font-medium mb-2">
          Description<span style={{ color: "red" }}>*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={TEXTAREA_CLASS}
          rows={4}
          placeholder="Enter Description"
        />
      </div> */}

      <Section title="Basics">
        {/* Preference */}
        <div className="mb-4">
          <label className="flex block text-sm font-medium mb-2 text-gray-700">
            <TagIcon className="w-4 h-4 text-orange-500 mr-1" />
            Listing Property for</label>
          <div className="flex flex-wrap gap-2">
            {(category === "residential" ? ["Rent", "Sale", "PG"] : ["Rent", "Sale"]).map((option) => (
              <button
                key={option}
                type="button"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition ${formData.preference === option
                    ? "bg-orange-100 border-orange-300 text-orange-900"
                    : "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200"
                  }`}
                onClick={() => setFormData((prev) => ({ ...prev, preference: option }))}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          {/* Property Type */}
          <div className="w-1/4">
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
              <Building className="w-4 h-4 text-orange-500 mr-1" />
              Property Type <span className="text-red-500">*</span></label>
            <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={SELECT_CLASS}>
              <option value="">{category === "residential" ? "-- Select Residential Type --" : "-- Select Commercial Type --"}</option>
              {subtypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Title */}
          <div className="w-3/4">
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
              <BookMarked className="w-4 h-4 text-orange-500 mr-1" />
              Property Name/Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className={INPUT_CLASS} placeholder="Enter Title" />
          </div>
        </div>

        {/* Description full width */}
        <div className="mt-4">
          <label className="flex block text-sm font-medium mb-2 text-gray-700">
            <FileText className="w-4 h-4 text-orange-500 mr-1" />
            Description <span className="text-red-500">*</span></label>
          <textarea name="description" value={formData.description} onChange={handleChange} className={TEXTAREA_CLASS} rows={4} placeholder="Enter Description" />
        </div>
      </Section>


      {/* Floors block (hidden for Commercial Plot/Land) */}
      {/* {showFloorsUI && (
        <div className="flex items-end space-x-4 mb-6">

          <div className="flex-1">
            <label className="block text-lg font-medium mb-2">
              Total Floors<span style={{ color: "red" }}>*</span>
            </label>
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
            <label className="block text-lg font-medium mb-2">Select Floor</label>
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
      )} */}

      {showFloorsUI && (
        <Section title="Floors" className="mt-6">
          <Row>
            <div>
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <Layers className="w-4 h-4 text-orange-500 mr-1" />
                Total Floors <span className="text-red-500">*</span></label>
              <input type="number" min={0} max={500} value={totalFloorsInput} onChange={(e) => setTotalFloorsInput(e.target.value.replace(/\D/g, ""))} className={INPUT_CLASS} placeholder="Enter total floors" />
            </div>
            <div>
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <DoorClosed className="w-4 h-4 text-orange-500 mr-1" />
                Select Floor</label>
              <select name="floor" value={String(formData.floor ?? "")} onChange={(e) => {
                const v = Number(e.target.value);
                setFormData((prev) => ({ ...prev, floor: Number.isNaN(v) ? prev.floor : v }));
              }} className={SELECT_CLASS}>
                {getFloorOptions(totalFloorsInput).map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </Row>
        </Section>
      )}


      {/* Residential-only fields */}
      {/* {category === "residential" && (
        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-lg font-medium mb-2">Maintenance (₹)</label>
            <input
              type="text"
              name="maintenance"
              value={formData.maintenance ?? ""}
              onChange={handleMaintenanceChange}
              className={INPUT_CLASS}
              placeholder="Enter maintenance in Rs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lg font-medium mb-2">
                Bedrooms<span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => decrement("bedrooms")} className="px-3 py-1 bg-gray-200 rounded">-</button>
                <div className="px-4">{formData.bedrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bedrooms")} className="px-3 py-1 bg-gray-200 rounded">+</button>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium mb-2">
                Bathrooms<span style={{ color: "red" }}>*</span>
              </label>
              <div className="flex items-center space-x-2">
                <button type="button" onClick={() => decrement("bathrooms")} className="px-3 py-1 bg-gray-200 rounded">-</button>
                <div className="px-4">{formData.bathrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bathrooms")} className="px-3 py-1 bg-gray-200 rounded">+</button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Furnishing<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="furnishing"
              value={formData.furnishing}
              onChange={handleChange}
              className={SELECT_CLASS}
            >
              {FURNISHING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">
              Facing<span style={{ color: "red" }}>*</span>
            </label>
            <select
              name="facing"
              value={formData.facing}
              onChange={handleChange}
              className={SELECT_CLASS}
            >
              {FACING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">RERA Number</label>
            <input
              type="text"
              name="reraNumber"
              value={formData.reraNumber ?? ""}
              onChange={handleChange}
              className={INPUT_CLASS}
              placeholder="Enter RERA Number (if any)"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2">Number of Balconies</label>
            <input
              type="number"
              name="balconies"
              value={formData.balconies ?? 0}
              onChange={handleBalconiesChange}
              className={INPUT_CLASS}
              placeholder="Enter number of balconies"
            />
          </div>

          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              Reserved Parking <span className="text-sm text-gray-400 italic">(Optional)</span>
            </h3>
            <div className="flex space-x-8">
              
              <div className="flex items-center justify-start space-x-4">
                <label className="text-sm text-gray-700">Covered Parking</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    aria-label="Decrease covered parking"
                    onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Math.max(0, Number(prev.coveredParking ?? 0) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    −
                  </button>
                  <div className="w-8 text-center text-sm">{formData.coveredParking ?? 0}</div>
                  <button
                    type="button"
                    aria-label="Increase covered parking"
                    onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Number(prev.coveredParking ?? 0) + 1 }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    +
                  </button>
                </div>
              </div>
             
              <div className="flex items-center justify-start space-x-4">
                <label className="text-sm text-gray-700">Open Parking</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    aria-label="Decrease open parking"
                    onClick={() => setFormData((prev) => ({ ...prev, openParking: Math.max(0, Number(prev.openParking ?? 0) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    −
                  </button>
                  <div className="w-8 text-center text-sm">{formData.openParking ?? 0}</div>
                  <button
                    type="button"
                    aria-label="Increase open parking"
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
            <label className="block text-lg font-medium mb-2">Power Backup</label>
            <select
              name="powerBackup"
              value={formData.powerBackup}
              onChange={handlePowerBackupChange}
              className={SELECT_CLASS}
            >
              <option value="None">None</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>
        </div>
      )} */}

      {category === "residential" && (
        <Section title="Residential Details" className="mt-6">
          <Row>
            <div className="mt-1">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <Wrench className="w-4 h-4 text-orange-500 mr-1" />
                Maintenance (₹)</label>
              <input type="text" name="maintenance" value={formData.maintenance ?? ""} onChange={handleMaintenanceChange} className={INPUT_CLASS} placeholder="Enter maintenance in Rs" />
            </div>
            <div className="mt-1">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <BadgeCheck className="w-4 h-4 text-orange-500 mr-1" />
                RERA Number</label>
              <input type="text" name="reraNumber" value={formData.reraNumber ?? ""} onChange={handleChange} className={INPUT_CLASS} placeholder="Enter RERA Number (if any)" />
            </div>
          </Row>

          <Row>
            <div className="mt-3">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <Sofa className="w-4 h-4 text-orange-500 mr-1" />
                Furnishing <span className="text-red-500">*</span></label>
              <select name="furnishing" value={formData.furnishing} onChange={handleChange} className={SELECT_CLASS}>
                {FURNISHING_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="mt-3">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <Compass className="w-4 h-4 text-orange-500 mr-1" />
                Facing <span className="text-red-500">*</span></label>
              <select name="facing" value={formData.facing} onChange={handleChange} className={SELECT_CLASS}>
                {FACING_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </Row>

          <Row>
            <div className="mt-3 mb-1">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <BedDouble className="w-4 h-4 text-orange-500 mr-1" />
                Bedrooms <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => decrement("bedrooms")} className="w-8 h-8 px-3 py-1 rounded text-white bg-orange-500 border border-orange-500">-</button>
                <div className="px-3">{formData.bedrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bedrooms")} className="w-8 h-8 px-3 py-1 rounded text-white bg-orange-500 border border-orange-500">+</button>
              </div>
            </div>
            <div className="mt-3 mb-1">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <Bath className="w-4 h-4 text-orange-500 mr-1" />
                Bathrooms <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => decrement("bathrooms")} className="w-8 h-8 px-3 py-1 rounded text-white bg-orange-500 border border-orange-500">-</button>
                <div className="px-3">{formData.bathrooms ?? 0}</div>
                <button type="button" onClick={() => increment("bathrooms")} className="w-8 h-8 px-3 py-1 rounded text-white bg-orange-500 border border-orange-500">+</button>
              </div>
            </div>
          </Row>

          <Row>
            <div className="mt-3 mb-1">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <PanelsTopLeft className="w-4 h-4 text-orange-500 mr-1" />
                Number of Balconies</label>
              <input type="text" name="balconies" value={formData.balconies ?? 0} onChange={handleBalconiesChange} className={INPUT_CLASS} placeholder="Enter number of balconies" />
            </div>
            <div className="mt-3 mb-1">
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <BatteryCharging className="w-4 h-4 text-orange-500 mr-1" />
                Power Backup</label>
              <select name="powerBackup" value={formData.powerBackup} onChange={handlePowerBackupChange} className={SELECT_CLASS}>
                <option value="None">None</option>
                <option value="Partial">Partial</option>
                <option value="Full">Full</option>
              </select>
            </div>
          </Row>
          
            <div className="mt-3">
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <Car className="w-4 h-4 text-orange-500 mr-1" />
                Reserved Parking <span className="text-sm text-gray-400 ml-1 italic">(Optional)</span></label>
            <div className="flex space-x-8">
            <Row>
              <div className="flex items-center justify-start space-x-4">
                <label className="text-sm text-gray-700">Covered Parking</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    aria-label="Decrease covered parking"
                    onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Math.max(0, Number(prev.coveredParking ?? 0) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    −
                  </button>
                  <div className="w-8 text-center text-sm">{formData.coveredParking ?? 0}</div>
                  <button
                    type="button"
                    aria-label="Increase covered parking"
                    onClick={() => setFormData((prev) => ({ ...prev, coveredParking: Number(prev.coveredParking ?? 0) + 1 }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-start space-x-4">
                <label className="text-sm text-gray-700">Open Parking</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    aria-label="Decrease open parking"
                    onClick={() => setFormData((prev) => ({ ...prev, openParking: Math.max(0, Number(prev.openParking ?? 0) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    −
                  </button>
                  <div className="w-8 text-center text-sm">{formData.openParking ?? 0}</div>
                  <button
                    type="button"
                    aria-label="Increase open parking"
                    onClick={() => setFormData((prev) => ({ ...prev, openParking: Number(prev.openParking ?? 0) + 1 }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-orange-300 bg-orange-500 text-white font-bold hover:bg-orange-600"
                  >
                    +
                  </button>
                </div>
              </div>
              </Row>
            </div>
          </div>
        </Section>
      )}


      {/* Shared: Price & Area & Age & Availability */}
      {/* <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-lg font-medium mb-2">
            Price in ₹<span style={{ color: "red" }}>*</span>
          </label>
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
          <label className="block text-lg font-medium mb-2">
            Area (sq.ft)<span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className={INPUT_CLASS}
            placeholder="Enter Area"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">
            Age<span style={{ color: "red" }}>*</span>
          </label>
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
              <label className="block text-lg font-medium mb-2">Availability</label>
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
                  <label className="block text-sm font-medium mb-1">Possession By</label>
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
          )} */}

          {/* If not Sell, show (optional) Security Deposit */}
          {/* {!isSell && (
            <div className="mt-3">
              <label className="block text-lg font-medium mb-2">Security Deposit (optional)</label>
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
      </div> */}

      <Section title="Pricing & Availability" className="mt-6">
        <Row>
          {/* Price */}
          <div>
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
              <IndianRupee className="w-4 h-4 text-orange-500 mr-1" />
              Price in ₹ <span className="text-red-500">*</span></label>
            <input type="text" name="price" value={priceInput} onChange={handlePriceChange} className={INPUT_CLASS} placeholder="₹ Expected Price" />
            <p className="mt-1.5 text-xs italic text-gray-500">
              {formData.price > 0 ? `₹ ${formData.price.toLocaleString("en-IN")} (${numberToIndianWords(formData.price)} only)` : "\u00a0"}
            </p>
          </div>

          {/* Area */}
          <div>
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
              <Maximize2 className="w-4 h-4 text-orange-500 mr-1" />
              Area (sq.ft) <span className="text-red-500">*</span></label>
            <input type="text" name="area" value={formData.area} onChange={handleAreaChange} className={INPUT_CLASS} placeholder="Enter Area" />
          </div>

          {/* Age */}
          <div>
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
              <History className="w-4 h-4 text-orange-500 mr-1" />
              Age <span className="text-red-500">*</span></label>
            <select name="age" value={formData.age} onChange={handleChange} className={SELECT_CLASS}>
              {AGE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Availability (conditional) */}
          <div>
            {showAvailability && (
              <>
                <label className="flex block text-sm font-medium mb-2 text-gray-700">
                  <CalendarCheck className="w-4 h-4 text-orange-500 mr-1" />
                  Availability</label>
                <select name="availability" value={formData.availability} onChange={handleChange} className={SELECT_CLASS}>
                  <option value="Ready to move">Ready to move</option>
                  <option value="Under Construction">Under Construction</option>
                </select>

                {formData.availability === "Under Construction" && (
                  <div className="mt-3">
                    <label className="flex block text-sm font-medium mb-1 text-gray-600">
                      <CalendarRange className="w-4 h-4 text-orange-500 mr-1" />
                      Possession By</label>
                    <select name="possessionBy" value={formData.possessionBy ?? ""} onChange={handleChange} className={SELECT_CLASS}>
                      <option value="">-- Select Possession --</option>
                      {POSSESSION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}
            {!isSell && (
              <div className="mt-2">
                <label className="flex block text-sm font-medium mb-2 text-gray-700">
                  <Shield className="w-4 h-4 text-orange-500 mr-1" />
                  Security Deposit (optional)</label>
                <input type="text" name="securityDeposit" value={formData.securityDeposit ?? ""} onChange={handleSecurityDepositChange} className={INPUT_CLASS} placeholder="Enter security deposit (optional)" />
              </div>
            )}
          </div>
        </Row>
      </Section>


      {/* Address & Media & Amenities */}
      {/* <div className="mb-6">
        <label className="block text-lg font-medium mb-2">
          Address<span style={{ color: "red" }}>*</span>
        </label>
        <AddressSelector
          stateValue={String(formData.state || "")}
          cityValue={String(formData.city || "")}
          localityValue={String(formData.locality || "")}
          onChange={handleAddressChange}
        />
        <MediaUploader onChanged={onMediaChanged} />
        {category !== "commercial" && <AmenitiesPanel formData={formData} setFormData={setFormData} />}
      </div> */}

      <Section title="Address" className="mt-6">
        <label className="flex block text-sm font-medium mb-2 text-gray-700"><MapPin className="w-4 h-4 text-orange-500 shrink-0 mr-1" />
        Location 
        <span className="text-red-500">*</span></label>
        <AddressSelector
          key={addressKey}
          stateValue={String(formData.state || "")}
          cityValue={String(formData.city || "")}
          localityValue={String(formData.locality || "")}
          addressValue={String(formData.address || "")}
          pincodeValue={formData.pincode}
          nearbyPlaceValue={String(formData.nearbyPlace || "")}
          onChange={handleAddressChange}
        />
      </Section>

      <Section title="Media" className="mt-6">
        <MediaUploader key={mediaKey} onChanged={onMediaChanged} />
      </Section>

      {category !== "commercial" && (
        <Section title="Amenities" className="mt-6">
          <AmenitiesPanel formData={formData} setFormData={setFormData} />
        </Section>
      )}


      {/* Commercial-only fields */}
      {/* {category === "commercial" && (
        <div className="space-y-4">
          {showCabins && (
            <div>
              <label className="block text-lg font-medium mb-2">Cabins</label>
              <input
                type="number"
                name="cabins"
                value={formData.cabins ?? 0}
                onChange={handleChange}
                className={INPUT_CLASS}
              />
            </div>
          )}

          <div className="flex gap-4">
            <label>
              <input type="checkbox" name="meetingRoom" checked={formData.meetingRoom || false} onChange={handleChange} /> Meeting Room
            </label>
            <label>
              <input type="checkbox" name="conferenceRoom" checked={formData.conferenceRoom || false} onChange={handleChange} /> Conference Room
            </label>
            <label>
              <input type="checkbox" name="receptionArea" checked={formData.receptionArea || false} onChange={handleChange} /> Reception Area
            </label>
            <label>
              <input type="checkbox" name="washroom" checked={formData.washroom || false} onChange={handleChange} /> Washroom
            </label>
          </div>
          <div className="flex gap-4">
            <label>
              <input type="checkbox" name="lift" checked={formData.lift || false} onChange={handleChange} /> Lift
            </label>
            <label>
              <input type="checkbox" name="parking" checked={formData.parking || false} onChange={handleChange} /> Parking
            </label>
          </div>

          
          <div>
            <label className="block text-lg font-medium mb-2">Lock-in (months)</label>
            <input
              type="number"
              name="lockIn"
              value={formData.lockIn ?? 0}
              onChange={handleChange}
              disabled={isSell}
              className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>
          <div>
            <label className="block text-lg font-medium mb-2">Yearly Increase (%)</label>
            <input
              type="number"
              name="yearlyIncrease"
              value={formData.yearlyIncrease ?? 0}
              onChange={handleChange}
              disabled={isSell}
              className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>
      )} */}

      {category === "commercial" && (
      <Section title="Commercial Features" className="mt-6">
        {showCabins && (
          <Row cols={3}>
            <div>
              <label className="flex block text-sm font-medium mb-2 text-gray-700">
                <Briefcase className="w-4 h-4 text-orange-500 mr-1" />
                Cabins</label>
              <input type="number" name="cabins" value={formData.cabins ?? 0} onChange={handleChange} className={INPUT_CLASS} />
            </div>
          </Row>
        )}
        <div className="flex flex-wrap gap-6 mt-2 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="meetingRoom" checked={!!formData.meetingRoom} onChange={handleChange} className="accent-orange-600" />
          Meeting Room <Users className="w-4 h-4 text-orange-500" />
          </label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="conferenceRoom" checked={!!formData.conferenceRoom} onChange={handleChange} className="accent-orange-600" />
          Conference Room <Projector className="w-4 h-4 text-orange-500" />
          </label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="receptionArea" checked={!!formData.receptionArea} onChange={handleChange} className="accent-orange-600" />
          Reception Area <ConciergeBell className="w-4 h-4 text-orange-500" />
          </label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="washroom" checked={!!formData.washroom} onChange={handleChange} className="accent-orange-600" />
          Washroom <SoapDispenserDroplet className="w-4 h-4 text-orange-500" />
          </label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="lift" checked={!!formData.lift} onChange={handleChange} className="accent-orange-600" />
          Lift <ChevronsUpDown className="w-4 h-4 text-orange-500" />
          </label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="parking" checked={!!formData.parking} onChange={handleChange} className="accent-orange-600" />
          Parking <CarFront className="w-4 h-4 text-orange-500" />
          </label>
        </div>

        <Row className="mt-4">
          <div>
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
              <LockIcon className="w-4 h-4 text-orange-500 mr-1" />
              Lock-in (months)</label>
            <input type="number" name="lockIn" value={formData.lockIn ?? 0} onChange={handleChange} disabled={isSell} className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`} />
          </div>
          <div>
            <label className="flex block text-sm font-medium mb-2 text-gray-700">
              <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
              Yearly Increase (%)</label>
            <input type="number" name="yearlyIncrease" value={formData.yearlyIncrease ?? 0} onChange={handleChange} disabled={isSell} className={`${INPUT_CLASS} ${isSell ? "opacity-50 cursor-not-allowed" : ""}`} />
          </div>
        </Row>
      </Section>
    )}


    {/* <div className="flex items-end space-x-4 mt-6 mb-6">
      <button
        type="button"
        onClick={resetForm}
        className="w-full mt-3 bg-gray-200 text-gray-800 font-medium py-3 rounded hover:bg-gray-300 focus:outline-none transition"
      >
        RESET FORM
      </button>
      <button onClick={handleSubmit} className="w-full bg-themeOrange text-white font-bold py-3 rounded hover:bg-hoverOrange focus:outline-none">
        SUBMIT PROPERTY FOR REVIEW
      </button>
      </div> */}

      <div className="grid md:grid-cols-2 gap-3 mt-8">
        <button type="button" onClick={resetForm} className="w-full bg-gray-100 text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-200 border border-gray-200 transition">
          RESET FORM
        </button>
        <button onClick={handleSubmit} className="w-full bg-themeOrange text-white font-semibold py-3 rounded-lg hover:brightness-95 transition">
          SUBMIT PROPERTY FOR REVIEW
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

export default PropertyForm;
