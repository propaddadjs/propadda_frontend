// src/pages/admin/ListingDetail.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

// Lucide icons
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Bath,
  Bed,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  FileDown,
  IndianRupee,
  MapPin,
  Ruler,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  XCircle,
  Images,
  Video,
  ArrowRight,
  StarOff,
  BadgeX,
  TimerOff,
  Hourglass,
  CalendarCheck,
  History,
  Contact,
  Maximize2,
  BedDouble,
  Shapes,
  Tag,
  Layers,
  CircleCheckBig,
  DoorClosed
} from "lucide-react";

interface MediaResponse { filename?: string; ord?: number; url: string; }
interface OwnerResponse {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}
interface PropertyDetail {
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
  reraVerified?: Boolean;
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
  // you can extend with all other fields if needed
  [key: string]: any;
}

const prettyKey = (k: string) =>
  k
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b([a-z])/g, s => s.toUpperCase());

const booleanFieldKeys = (obj: PropertyDetail) =>
  Object.keys(obj).filter(
    (k) =>
      typeof obj[k] === "boolean" &&
      !["vip", "reraVerified", "expired"].includes(k)
  );

const ListingDetail: React.FC = () => {
  const { category, id } = useParams<{ category?: string; id?: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";


  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, id]);

  // LOCK SCROLL & TOUCH when modal open
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

  const fetchDetail = async () => {
    if (!category || !id) return;
    setLoading(true);
    try {
      const resp = await axios.get<PropertyDetail>(
        `${API_BASE_URL}/admin/property/${category}/${id}`
      );
      console.log("getById response::",resp.data);
      setProperty(resp.data);
    } catch (e) {
      console.error("Failed to fetch property detail", e);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleSold = async () => {
    if (!category || !id) return;
    try {
      await axios.patch(`${API_BASE_URL}/admin/properties/markPropertyAsSold/${category}/${id}`);
      navigate("/admin/listings/active");
    } catch (e) {
      console.error(e);
      alert("Mark Sold failed");
    }
  };
  const handleApprove = async () => {
    if (!category || !id) return;
    try {
      await axios.patch(`${API_BASE_URL}/admin/properties/approve/${category}/${id}`);
      navigate("/admin/listings/active");
    } catch (e) {
      console.error(e);
      alert("Approve failed");
    }
  };
  const openRejectModal = () => {
    setRejectReason("");
    setShowRejectModal(true);
  };
  const cancelReject = () => {
    setShowRejectModal(false);
  };
  const confirmReject = async () => {
    if (!rejectReason || !rejectReason.trim()) {
      alert("Please provide a rejection reason (mandatory).");
      textareaRef.current?.focus();
      return;
    }
    if (!category || !id) return;
    try {
      await axios.patch(`${API_BASE_URL}/admin/properties/reject/${category}/${id}`, {
        reason: rejectReason.trim()
      });
      setShowRejectModal(false);
      navigate("/admin/listings/pending");
    } catch (e) {
      console.error(e);
      alert("Reject failed");
    }
  };
  const toggleVip = async () => {
    if (!category || !id) return;
    try {
      await axios.patch(`${API_BASE_URL}/admin/toggleVip/${category}/${id}`);
      await fetchDetail();
    } catch (e) {
      console.error(e);
      alert("Failed to toggle VIP");
    }
  };

  const toggleRera = async () => {
    if (!category || !id) return;
    try {
      await axios.patch(`${API_BASE_URL}/admin/toggleReraVerified/${category}/${id}`);
      await fetchDetail();
    } catch (e) {
      console.error(e);
      alert("Failed to toggle RERA Verified");
    }
  };

  // media handling (images first, then video)
  const media: MediaResponse[] = useMemo(() => {
    const arr = property?.mediaFiles ?? property?.media ?? [];
    const copy = [...arr].sort((a, b) => {
      const oa = typeof a.ord === "number" ? a.ord : 999;
      const ob = typeof b.ord === "number" ? b.ord : 999;
      if (oa === -1 && ob !== -1) return 1;
      if (ob === -1 && oa !== -1) return -1;
      return oa - ob;
    });
    return copy;
  }, [property]);

  const images = media.filter((m) => (typeof m.ord === "number" ? m.ord > 0 : true));
  const video = media.find((m) => m.ord === 0);
  const brochure = media.find((m) => m.ord === -1);

  const carouselSlides = useMemo(() => {
    const slides: { type: "image" | "video"; url: string; filename?: string }[] = [];
    images.forEach((img) => slides.push({ type: "image", url: img.url, filename: img.filename }));
    if (video) slides.push({ type: "video", url: video.url, filename: video.filename });
    return slides;
  }, [video, images]);

  const isPending = (prop?: PropertyDetail) => {
    return (prop?.adminApproved ?? "").toLowerCase() === "pending";
  };

  const pill = (
    label: React.ReactNode,
    classes: string
  ) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-600">
        <Images className="h-4 w-4 animate-pulse" />
        Loading...
      </div>
    );
  }
  if (!property) return <div className="p-6">No listing found.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-white font-semibold bg-themeOrange rounded px-3 py-1.5 shadow transition hover:scale-[1.03]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {property.title ?? "Untitled Property"}
          </h1>
          <div className="text-sm text-gray-500">ID: {property.listingId}</div>
        </div>

        <div className="flex items-center gap-2">
          {property.vip && pill(<><Star className="h-3.5 w-3.5"/> VIP</>, "bg-yellow-100 text-yellow-800")}
          {property.reraVerified && pill(<><BadgeCheck className="h-3.5 w-3.5"/> RERA Verified</>, "bg-purple-100 text-purple-800")}
          {property.sold ? (
            // Use h-3.5 w-3.5 for consistency, or keep h-5 w-5 if you want it bigger
            pill(<><CircleCheckBig className="h-5 w-5"/> Sold</>, "bg-blue-100 text-blue-700 font-bold text-[26px]")
        ) : (
            // 2. Only show Admin/Expiration status if NOT sold
            <>
                {!property.expired && property.adminApproved && (
                    property.adminApproved === "Pending"
                        ? pill(<><Hourglass className="h-3.5 w-3.5"/> Pending</>, "bg-yellow-50 text-yellow-600")
                        : property.adminApproved === "Approved"
                            ? pill(<><CheckCircle2 className="h-3.5 w-3.5"/> Approved</>, "bg-green-100 text-green-700")
                            : pill(<><Ban className="h-3.5 w-3.5"/> Rejected</>, "bg-red-100 text-red-700")
                )}
                {property.expired && pill(<><TimerOff className="h-3.5 w-3.5"/> Expired</>, "bg-red-100 text-red-700")}
            </>
        )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Gallery / Media */}
        <div className="col-span-7 bg-white rounded-lg shadow p-4">
          {carouselSlides.length === 0 ? (
            <div className="w-full h-96 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              <Images className="h-5 w-5 mr-2"/> No media available
            </div>
          ) : (
            <Carousel className="property-carousel"
              showArrows
              showThumbs
              emulateTouch
              infiniteLoop
              showStatus={false}
              dynamicHeight={false}
              renderThumbs={() =>
                carouselSlides.map((s, i) => {
                  if (s.type === "image") {
                    return <img key={i} src={s.url} alt={s.filename ?? `thumb-${i}`} />;
                  }
                  const poster = images.length ? images[0].url : undefined;
                  if (poster) {
                    return <img key={i} src={poster} alt={s.filename ?? `video-thumb-${i}`} />;
                  }
                  return (
                    <div
                      key={i}
                      style={{
                        width: 80,
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#111",
                        color: "#fff",
                        fontSize: 12,
                        borderRadius: 4
                      }}
                    >
                      VIDEO
                    </div>
                  );
                })
              }
              renderArrowPrev={(onClickHandler, hasPrev, label) =>
                hasPrev && (
                  <button
                    type="button"
                    onClick={onClickHandler}
                    title={label}
                    className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-orange-400 text-white rounded-full shadow p-2 transition hover:scale-105"
                  >
                    <ArrowLeft className="h-5 w-5"/>
                  </button>
                )
              }
              renderArrowNext={(onClickHandler, hasNext, label) =>
                hasNext && (
                  <button
                    type="button"
                    onClick={onClickHandler}
                    title={label}
                    className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-orange-400 text-white rounded-full shadow p-2 transition hover:scale-105"
                  >
                    {/* Using transform rotate-180 on ArrowLeft would also work; leave default carousel icon here if preferred */}
                    {/* ▶ */}
                     <ArrowRight className="h-5 w-5"/>
                  </button>
                )
              }
            >
              {carouselSlides.map((s, idx) => (
                <div key={idx} style={{ maxHeight: 560, background: "#000000ff", color: "white"}}>
                  {s.type === "video" ? (
                    <video controls style={{ width: "100%", maxHeight: 560 }} src={s.url} />
                  ) : (
                    <img src={s.url} alt={s.filename ?? `image-${idx}`} style={{ width: "100%", objectFit: "cover", maxHeight: 560 }} />
                  )}
                </div>
              ))}
            </Carousel>
          )}

          <div className="mt-3 flex items-center gap-3">
            {brochure && (
              <a
                href={brochure.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded bg-themeOrange text-white text-sm font-semibold inline-flex items-center gap-2 shadow transition hover:scale-[1.03]"
              >
                <FileDown className="h-4 w-4"/> View Brochure
              </a>
            )}
            <div className="text-sm text-gray-500 inline-flex items-center gap-2">
              <Images className="h-4 w-4"/> {images.length} image(s)
              {video && (
                <span className="inline-flex items-center gap-1 text-gray-500">
                  • <Video className="h-4 w-4"/> 1 video
                </span>
              )}
            </div>
          </div>
           
            {/* <div className="mt-6 bg-white rounded-lg shadow p-4"> */}
            <div className="grid grid-cols-1 gap-2">
               {property.description && (
              <div className="mt-4 text-sm text-gray-700">
                <h3 className="text-base font-semibold mb-1 inline-flex items-center gap-2">
                  <FileText className="h-4 w-4"/> Description
                </h3>
                <p className="whitespace-pre-wrap leading-relaxed">{property.description}</p>
              </div>
            )}

              <h3 className="text-xl text-center font-bold text-black mb-3 rounded inline-flex items-center justify-center gap-2 py-2">
                <Building2 className="h-5 w-5"/> Additional Property Details
              </h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {Object.entries(property).map(([k, v]) => {
                  if (
                    k === "media" || k === "mediaFiles" || k === "residentialPropertyMediaFiles" || k === "commercialPropertyMediaFiles" ||
                    k === "listingId" || k === "category" || k === "preference" || k === "propertyType" || k === "title" || k === "description" ||
                    k === "price" || k === "area" || k === "age" || k === "availability" || k === "reraNumber" || k === "reraVerified" ||
                    k === "state" || k === "city" || k === "locality" || k === "address" || k === "pincode" || k === "nearbyPlace" ||
                    k === "expired" || k === "residentialOwner" || k === "commercialOwner" || k === "vip" ||
                    k === "centerCooling" || k === "fireAlarm" || k === "heating" || k === "gym" || k === "modularKitchen" || k === "pool" || k === "elevator" || k === "petFriendly" || k === "storage" || k === "laundry" || k === "dishwasher" || k === "dryer" || k === "sauna" || k === "emergencyExit" || k === "waterPurifier" || k === "gasPipeline" || k === "park" || k === "vastuCompliant" || k === "rainWaterHarvesting" || k === "maintenanceStaff" ||
                    k === "poojaRoom" || k === "studyRoom" || k === "servantRoom" || k === "storeRoom" || k === "highCeilingHeight" || k === "falseCeilingLighting" || k === "internetConnectivity" || k === "centrallyAirConditioned" || k === "securityFireAlarm" || k === "recentlyRenovated" || k === "privateGardenTerrace" || k === "naturalLight" || k === "airyRooms" || k === "intercomFacility" || k === "spaciousInteriors" ||
                    k === "fitnessCenter" || k === "swimmingPool" || k === "clubhouseCommunityCenter" || k === "securityPersonnel" || k === "lifts" ||
                    k === "separateEntryForServantRoom" || k === "noOpenDrainageAround" || k === "bankAttachedProperty" || k === "lowDensitySociety" ||
                    k === "municipalCorporation" || k === "borewellTank" || k === "water24x7" ||
                    k === "overlookingPool" || k === "overlookingParkGarden" || k === "overlookingClub" || k === "overlookingMainRoad" ||
                    k === "inGatedSociety" || k === "cornerProperty" || k === "petFriendlySociety" || k === "wheelchairFriendly" ||
                    k === "closeToMetroStation" || k === "closeToSchool" || k === "closeToHospital" || k === "closeToMarket" || k === "closeToRailwayStation" || k === "closeToAirport" || k === "closeToMall" || k === "closeToHighway" ||
                    k === "adminApproved" || k === "sold" || k === "createdAt" || k === "approvedAt"
                  ) return null;
                  return (
                    <div key={k} className="border rounded p-2">
                      <div className="text-xs text-gray-500">{prettyKey(k)}</div>
                      <div className="mt-1">{v === null || v === undefined ? "-" : String(v)}</div>
                    </div>
                  );
                })}
                </div>
              {/* </div> */}
          </div>
        </div>

        {/* Details column */}
        <div className="col-span-5 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5"/> Category
                </div>
                <div className="font-semibold">{property.category}</div>

                <div className="mt-3 text-xs text-gray-500 inline-flex items-center gap-1">
                  <Shapes className="h-3.5 w-3.5"/> Type
                </div>
                <div className="font-semibold">{property.propertyType ?? "-"}</div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold inline-flex items-center gap-2">
                  <IndianRupee className="h-5 w-5"/>
                  {property.price ? `${Number(property.price).toLocaleString("en-IN")}` : "-"}
                </div>
                <div className="mt-3 text-xs text-gray-500 flex items-center justify-end gap-1.5">
                  <Tag className="h-3.5 w-3.5"/>
                  <span>Property for</span>
                </div>
                <div className="font-semibold">{property.preference ?? "-"}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-3">

                <div className="flex items-start gap-2 p-2 rounded border">
                <Maximize2 className="h-4 w-4 mt-0.5 text-gray-500"/>
                <div>
                  <div className="text-xs text-gray-500">Area</div>
                  <div className="font-medium">{property.area ?? "-"} {property.area ? "sq.ft" : ""}</div>
                </div>
              </div>

                <div className="flex items-start gap-2 p-2 rounded border">
                <History className="h-4 w-4 mt-0.5 text-gray-500"/>
                <div>
                  <div className="text-xs text-gray-500">Age</div>
                  <div className="font-medium">{property.age ?? "-"}</div>
                </div>
              </div>
              </div>
              
              {/* A vertically stacked component for Beds & Baths */}
              <div className="space-y-3 rounded-lg border p-3">

                {/* Bedrooms Item */}
                <div className="flex items-center gap-3">
                  <BedDouble className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                  <div>
                    <div className="text-xs text-gray-500">Bedrooms</div>
                    <div className="font-semibold text-gray-800">{property.bedrooms ?? "-"}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-b border-gray-200"></div>

                {/* Bathrooms Item */}
                <div className="flex items-center gap-3">
                  <Bath className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                  <div>
                    <div className="text-xs text-gray-500">Bathrooms</div>
                    <div className="font-semibold text-gray-800">{property.bathrooms ?? "-"}</div>
                  </div>
                </div>

              </div>
              <div className="flex items-start gap-2 p-2 rounded border">
                <CalendarCheck className="h-4 w-4 mt-0.5 text-gray-500"/>
                <div>
                  <div className="text-xs text-gray-500">Availability</div>
                  <div className="font-medium">{property.availability ?? "-"}</div>
                </div>
              </div>
             {/* A single, combined component for Floor & Total Floors */}
              <div className="flex items-stretch rounded-lg border divide-x divide-gray-200">

                {/* Floor Section */}
                <div className="flex flex-1 items-center gap-3 p-3">
                  <DoorClosed className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                  <div>
                    <div className="text-xs text-gray-500">Floor</div>
                    <div className="font-semibold text-gray-800">{property.floor ?? "-"}</div>
                  </div>
                </div>

                {/* Total Floors Section */}
                <div className="flex flex-1 items-center gap-3 p-3">
                  <Layers className="h-5 w-5 text-gray-400 flex-shrink-0"/>
                  <div>
                    <div className="text-xs text-gray-500">Total Floors</div>
                    <div className="font-semibold text-gray-800">{property.totalFloors ?? "-"}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs text-gray-500 inline-flex items-center gap-1">
              <Contact className="h-3.5 w-3.5"/> Owner
            </div>
            <div className="mt-2">
              <div className="font-medium">
                {(property.residentialOwner?.firstName ?? property.commercialOwner?.firstName) || "-"} { (property.residentialOwner?.lastName ?? property.commercialOwner?.lastName) || ""}
              </div>
              <div className="text-sm text-gray-600">{property.residentialOwner?.email ?? property.commercialOwner?.email ?? "-"}</div>
              <div className="text-sm text-gray-600">{property.residentialOwner?.phoneNumber ?? property.commercialOwner?.phoneNumber ?? "-"}</div>
            </div>

            <div className="mt-3 text-xs text-gray-500 inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5"/> Location
            </div>
            <div className="text-sm">
              {[property.address,property.locality,property.nearbyPlace,property.city,property.state].filter(Boolean).join(", ")} - {property.pincode}
            </div>

            <div className="mt-3 flex gap-2">
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent([property.address, property.locality, property.city, property.state].filter(Boolean).join(", "))}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded bg-themeOrange text-white text-sm font-semibold inline-flex items-center gap-2 shadow transition hover:scale-[1.03]"
              >
                <MapPin className="h-4 w-4"/> View on Map
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-gray-500"/>
              <span>Features & Amenities</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const trueBooleans = booleanFieldKeys(property).filter((k) => property[k] === true);
                const displayed = showAll ? trueBooleans : trueBooleans.slice(0, 5);

                return (
                  <>
                    {displayed.map((k) => (
                      <span
                        key={k}
                        className="px-3 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-700 border border-themeOrange inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5"/> {prettyKey(k)}
                      </span>
                    ))}

                    {trueBooleans.length > 5 && (
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="px-3 py-1 text-xs rounded-full font-bold text-themeOrange bg-white hover:underline"
                      >
                        {showAll ? "Show Less" : `Show more (${trueBooleans.length - 5})`}
                      </button>
                    )}
                  </>
                );
              })()}

            </div>
          </div>
              {!property.sold && (
          <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
            {isPending(property) && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 rounded text-white bg-green-600 inline-flex items-center gap-2 shadow transition hover:scale-[1.03] hover:bg-green-700"
                >
                  <ThumbsUp className="h-4 w-4"/> Approve
                </button>
                <button
                  onClick={openRejectModal}
                  className="px-4 py-2 rounded text-white bg-red-600 inline-flex items-center gap-2 shadow transition hover:scale-[1.03] hover:bg-red-600"
                >
                  <ThumbsDown className="h-4 w-4"/> Reject
                </button>
              </div>
            )}
            {!isPending(property) && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSold}
                  className="px-4 py-2 rounded text-white bg-blue-600 inline-flex items-center gap-2 shadow transition hover:scale-[1.03] hover:bg-blue-700"
                >
                  <CircleCheckBig className="h-4 w-4"/> Mark as SOLD
                </button>
                {/* <button
                  onClick={openRejectModal}
                  className="px-4 py-2 rounded text-white bg-red-600 inline-flex items-center gap-2 shadow transition hover:scale-[1.03] hover:bg-red-600"
                >
                  <ThumbsDown className="h-4 w-4"/> Reject
                </button> */}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleVip}
                className="px-4 py-2 rounded text-white bg-yellow-500 inline-flex items-center gap-2 shadow transition hover:scale-[1.03] hover:bg-yellow-600"
              >
                {property.vip ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />} {/* <-- Changed here */}
                {property.vip ? "Unmark VIP" : "Mark VIP"}
              </button>

              {property.reraNumber ? (
                <button
                  onClick={toggleRera}
                  className="px-4 py-2 rounded text-white bg-purple-600 inline-flex items-center gap-2 shadow transition hover:scale-[1.03] hover:bg-purple-700"
                >
                  {property.reraVerified ? <BadgeX className="w-4 h-4" /> : <BadgeCheck className="w-4 h-4" />} {/* <-- Changed here */}
                  {property.reraVerified ? "Unmark RERA Verified" : "Mark RERA Verified"}
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded bg-gray-300 text-white cursor-not-allowed inline-flex items-center gap-2"
                  title="Add RERA number on property to enable"
                >
                  <BadgeCheck className="h-4 w-4"/> Mark RERA Verified
                </button>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-xl text-center font-bold text-black mb-3 rounded inline-flex items-center justify-center gap-2 py-2">
          <Building2 className="h-5 w-5"/> Additional Property Details
        </h3>
        <div className="grid grid-cols-4 gap-3 text-sm">
          {Object.entries(property).map(([k, v]) => {
            if (
              k === "media" || k === "mediaFiles" || k === "residentialPropertyMediaFiles" || k === "commercialPropertyMediaFiles" ||
              k === "listingId" || k === "category" || k === "preference" || k === "propertyType" || k === "title" || k === "description" ||
              k === "price" || k === "area" || k === "age" || k === "availability" || k === "reraNumber" || k === "reraVerified" ||
              k === "state" || k === "city" || k === "locality" || k === "address" || k === "pincode" || k === "nearbyPlace" ||
              k === "expired" || k === "residentialOwner" || k === "commercialOwner" || k === "vip" ||
              k === "centerCooling" || k === "fireAlarm" || k === "heating" || k === "gym" || k === "modularKitchen" || k === "pool" || k === "elevator" || k === "petFriendly" || k === "storage" || k === "laundry" || k === "dishwasher" || k === "dryer" || k === "sauna" || k === "emergencyExit" || k === "waterPurifier" || k === "gasPipeline" || k === "park" || k === "vastuCompliant" || k === "rainWaterHarvesting" || k === "maintenanceStaff" ||
              k === "poojaRoom" || k === "studyRoom" || k === "servantRoom" || k === "storeRoom" || k === "highCeilingHeight" || k === "falseCeilingLighting" || k === "internetConnectivity" || k === "centrallyAirConditioned" || k === "securityFireAlarm" || k === "recentlyRenovated" || k === "privateGardenTerrace" || k === "naturalLight" || k === "airyRooms" || k === "intercomFacility" || k === "spaciousInteriors" ||
              k === "fitnessCenter" || k === "swimmingPool" || k === "clubhouseCommunityCenter" || k === "securityPersonnel" || k === "lifts" ||
              k === "separateEntryForServantRoom" || k === "noOpenDrainageAround" || k === "bankAttachedProperty" || k === "lowDensitySociety" ||
              k === "municipalCorporation" || k === "borewellTank" || k === "water24x7" ||
              k === "overlookingPool" || k === "overlookingParkGarden" || k === "overlookingClub" || k === "overlookingMainRoad" ||
              k === "inGatedSociety" || k === "cornerProperty" || k === "petFriendlySociety" || k === "wheelchairFriendly" ||
              k === "closeToMetroStation" || k === "closeToSchool" || k === "closeToHospital" || k === "closeToMarket" || k === "closeToRailwayStation" || k === "closeToAirport" || k === "closeToMall" || k === "closeToHighway" ||
              k === "adminApproved" || k === "sold"
            ) return null;
            return (
              <div key={k} className="border rounded p-2">
                <div className="text-xs text-gray-500">{prettyKey(k)}</div>
                <div className="mt-1">{v === null || v === undefined ? "-" : String(v)}</div>
              </div>
            );
          })}
        </div>
      </div> */}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            style={{ backdropFilter: 'blur(6px)' }}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="relative border-2 border-solid bg-white w-full max-w-xl rounded shadow-lg p-6 z-50"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <h3 className="text-lg font-semibold mb-2 inline-flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600"/>
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
              <button onClick={cancelReject} className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded border inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4"/> Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className={`px-4 py-2 rounded text-white inline-flex items-center gap-2 ${rejectReason.trim() ? "bg-red-600 hover:bg-red-700" : "bg-gray-300 cursor-not-allowed"}`}
              >
                <ThumbsDown className="h-4 w-4"/> Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
