import React, { useEffect, useState } from "react";
import axios from "axios";
import EditPropertyForm from "../../components/EditPropertyForm"; // adjust path
import { useParams } from "react-router-dom";

type PropertyCategory = "Residential" | "Commercial";
type MediaDto = { mediaType: "IMAGE" | "VIDEO" | "BROCHURE"; name: string; url?: string };
interface OwnerResponse {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}
// type ApiResponse = {
//   // shape you get from backend; adjust as needed
// listingId: number;
//   category: PropertyCategory;
//   preference: string;
//   propertyType: string;
//   maintenance?: number;
//   title?: string;
//   description?: string;
//   price?: number;
//   area?: number;
//   city?: string;
//   state?: string;
//   locality?: string;
//   address?: string;
//   pincode?: number;
//   nearbyPlace?: string;
//   bedrooms?: number;
//   bathrooms?: number;
//   furnishing?: string;
//   facing?: string;
//   floor?: number;
//   age?: string;
//   availability?: string;
//   reraNumber?: string;
//   reraVerified?: Boolean;
//   totalFloors?: number;
//   securityDeposit?: number;
//   balconies?: number;
//   powerBackup?: string;
//   coveredParking?: number;
//   openParking?: number;
//   adminApproved?: string;
//   expired?: boolean;
//   vip?: boolean;
//   // media
//   media?: MediaDto[];       // fallback
//   mediaFiles?: MediaDto[];  // backend sample uses this
//   // owner
//   residentialOwner?: OwnerResponse;
//   commercialOwner?: OwnerResponse;
//   // commercial extras
//   cabins?: number;
//   meetingRoom?: boolean;
//   washroom?: boolean;
//   conferenceRoom?: boolean;
//   receptionArea?: boolean;
//   lift?: boolean;
//   parking?: boolean;
//   lockIn?: number;
//   yearlyIncrease?: number;
//   // amenities (partial list kept optional)
//   centerCooling?: boolean;
//   fireAlarm?: boolean;
//   heating?: boolean;
//   gym?: boolean;
//   modularKitchen?: boolean;
//   pool?: boolean;
//   elevator?: boolean;
//   petFriendly?: boolean;
//   storage?: boolean;
//   laundry?: boolean;
//   dishwasher?: boolean;
//   dryer?: boolean;
//   sauna?: boolean;
//   emergencyExit?: boolean;
//   waterPurifier?: boolean;
//   gasPipeline?: boolean;
//   park?: boolean;
//   vastuCompliant?: boolean;
//   rainWaterHarvesting?: boolean;
//   maintenanceStaff?: boolean;

//   // Other Rooms
//   poojaRoom?: boolean;
//   studyRoom?: boolean;
//   servantRoom?: boolean;
//   storeRoom?: boolean;
//   // Property Features
//   highCeilingHeight?: boolean;
//   falseCeilingLighting?: boolean;
//   internetConnectivity?: boolean;
//   centrallyAirConditioned?: boolean;
//   securityFireAlarm?: boolean;
//   recentlyRenovated?: boolean;
//   privateGardenTerrace?: boolean;
//   naturalLight?: boolean;
//   airyRooms?: boolean;
//   intercomFacility?: boolean;
//   spaciousInteriors?: boolean;
//   // Society or Building Features
//   fitnessCenter?: boolean;
//   swimmingPool?: boolean;
//   clubhouseCommunityCenter?: boolean;
//   securityPersonnel?: boolean;
//   lifts?: boolean;
//   // Additional Features
//   separateEntryForServantRoom?: boolean;
//   noOpenDrainageAround?: boolean;
//   bankAttachedProperty?: boolean;
//   lowDensitySociety?: boolean;
//   // Water Source
//   municipalCorporation?: boolean;
//   borewellTank?: boolean;
//   water24x7?: boolean;
//   // Overlooking
//   overlookingPool?: boolean;
//   overlookingParkGarden?: boolean;
//   overlookingClub?: boolean;
//   overlookingMainRoad?: boolean;
//   // Other Features
//   inGatedSociety?: boolean;
//   cornerProperty?: boolean;
//   petFriendlySociety?: boolean;
//   wheelchairFriendly?: boolean;
//   // Location Advantages
//   closeToMetroStation?: boolean;
//   closeToSchool?: boolean;
//   closeToHospital?: boolean;
//   closeToMarket?: boolean;
//   closeToRailwayStation?: boolean;
//   closeToAirport?: boolean;
//   closeToMall?: boolean;
//   closeToHighway?: boolean;
//   // you can extend with all other fields if needed
//   [key: string]: any;
// };

// helper: safe filename (falls back to url last segment)
const nameFrom = (m: { url: string; filename?: string | null }) => {
  if (m.filename && m.filename.trim()) return m.filename;
  try {
    const u = new URL(m.url);
    const last = u.pathname.split("/").pop() || "";
    return decodeURIComponent(last);
  } catch {
    const parts = m.url.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "file");
  }
};

// helper: normalize category/value variants from API
// const toCategory = (s: string | undefined | null) =>
//   (s || "").toLowerCase() === "commercial" ? "commercial" : "residential";

// ---- MAP API SHAPE -> EditPropertyForm props ----
const mapApiToEditProps = (api: any) => {
  // split media by ord: 0 = video, -1 = brochure, others = images
  const media = Array.isArray(api.mediaFiles) ? api.mediaFiles : [];

  const videoItem = media.find((m: any) => m.ord === 0);
  const brochureItem = media.find((m: any) => m.ord === -1);
  const imageItems = media
    .filter((m: any) => m.ord !== 0 && m.ord !== -1)
    .sort((a: any, b: any) => (a.ord ?? 0) - (b.ord ?? 0));

  const existingMedia = {
    images: imageItems.map((m: any) => nameFrom(m)),
    video: videoItem ? nameFrom(videoItem) : undefined,
    brochure: brochureItem ? nameFrom(brochureItem) : undefined,
  };

  // build initial form data (copying what the Edit form expects)
  const initialData = {
    // non-editable (still needed in payload)
    preference: api.preference ?? "",
    propertyType: api.propertyType ?? "",

    // editable
    title: api.title ?? "",
    description: api.description ?? "",
    price: Number(api.price ?? 0),
    area: Number(api.area ?? 0),

    state: api.state ?? "",
    city: api.city ?? "",
    locality: api.locality ?? "",
    address: api.address ?? "",
    pincode: api.pincode ?? undefined,
    nearbyPlace: api.nearbyPlace ?? "",

    maintenance: api.maintenance ?? 0,
    bedrooms: api.bedrooms ?? 0,
    bathrooms: api.bathrooms ?? 0,
    furnishing: api.furnishing ?? "Unfurnished",
    facing: api.facing ?? "North",
    age: api.age ?? "0-1 Years",
    availability: api.availability ?? "Ready to move",
    possessionBy: api.possessionBy ?? null,
    floor: api.floor ?? 0,
    totalFloors: api.totalFloors ?? 0,
    reraNumber: api.reraNumber ?? "",
    balconies: api.balconies ?? 0,
    powerBackup: api.powerBackup ?? "None",
    securityDeposit: api.securityDeposit ?? undefined,
    coveredParking: api.coveredParking ?? 0,
    openParking: api.openParking ?? 0,

    // commercial extras
    cabins: api.cabins ?? 0,
    meetingRoom: !!api.meetingRoom,
    washroom: !!api.washroom,
    conferenceRoom: !!api.conferenceRoom,
    receptionArea: !!api.receptionArea,
    lift: !!api.lift,
    parking: !!api.parking,
    lockIn: api.lockIn ?? undefined,
    yearlyIncrease: api.yearlyIncrease ?? undefined,

    // amenities (booleans)
    centerCooling: !!api.centerCooling,
    fireAlarm: !!api.fireAlarm,
    heating: !!api.heating,
    gym: !!api.gym,
    modularKitchen: !!api.modularKitchen,
    pool: !!api.pool,
    elevator: !!api.elevator,
    petFriendly: !!api.petFriendly,
    storage: !!api.storage,
    laundry: !!api.laundry,
    dishwasher: !!api.dishwasher,
    dryer: !!api.dryer,
    sauna: !!api.sauna,
    emergencyExit: !!api.emergencyExit,
    waterPurifier: !!api.waterPurifier,
    gasPipeline: !!api.gasPipeline,
    park: !!api.park,
    vastuCompliant: !!api.vastuCompliant,
    rainWaterHarvesting: !!api.rainWaterHarvesting,
    maintenanceStaff: !!api.maintenanceStaff,

    poojaRoom: !!api.poojaRoom,
    studyRoom: !!api.studyRoom,
    servantRoom: !!api.servantRoom,
    storeRoom: !!api.storeRoom,

    highCeilingHeight: !!api.highCeilingHeight,
    falseCeilingLighting: !!api.falseCeilingLighting,
    internetConnectivity: !!api.internetConnectivity,
    centrallyAirConditioned: !!api.centrallyAirConditioned,
    securityFireAlarm: !!api.securityFireAlarm,
    recentlyRenovated: !!api.recentlyRenovated,
    privateGardenTerrace: !!api.privateGardenTerrace,
    naturalLight: !!api.naturalLight,
    airyRooms: !!api.airyRooms,
    intercomFacility: !!api.intercomFacility,
    spaciousInteriors: !!api.spaciousInteriors,

    fitnessCenter: !!api.fitnessCenter,
    swimmingPool: !!api.swimmingPool,
    clubhouseCommunityCenter: !!api.clubhouseCommunityCenter,
    securityPersonnel: !!api.securityPersonnel,
    lifts: !!api.lifts,

    separateEntryForServantRoom: !!api.separateEntryForServantRoom,
    noOpenDrainageAround: !!api.noOpenDrainageAround,
    bankAttachedProperty: !!api.bankAttachedProperty,
    lowDensitySociety: !!api.lowDensitySociety,

    municipalCorporation: !!api.municipalCorporation,
    borewellTank: !!api.borewellTank,
    water24x7: !!api.water24x7,

    overlookingPool: !!api.overlookingPool,
    overlookingParkGarden: !!api.overlookingParkGarden,
    overlookingClub: !!api.overlookingClub,
    overlookingMainRoad: !!api.overlookingMainRoad,

    inGatedSociety: !!api.inGatedSociety,
    cornerProperty: !!api.cornerProperty,
    petFriendlySociety: !!api.petFriendlySociety,
    wheelchairFriendly: !!api.wheelchairFriendly,

    closeToMetroStation: !!api.closeToMetroStation,
    closeToSchool: !!api.closeToSchool,
    closeToHospital: !!api.closeToHospital,
    closeToMarket: !!api.closeToMarket,
    closeToRailwayStation: !!api.closeToRailwayStation,
    closeToAirport: !!api.closeToAirport,
    closeToMall: !!api.closeToMall,
    closeToHighway: !!api.closeToHighway,
  };

  return {
    category: api.category,
    listingId: api.listingId,
    initialData,
    existingMedia,
  };
};


 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const agentId = 2; // ← your hardcoded agent id for now

const EditPropertyPage: React.FC = () => {
  const { id, category } = useParams<{ id: string; category: PropertyCategory }>();
  const [loading, setLoading] = useState(true);
const [mapped, setMapped] = useState<{
  category: PropertyCategory;
  listingId: number;
  initialData: any;
  existingMedia: { images: string[]; video?: string; brochure?: string };
} | null>(null);

useEffect(() => {
  (async () => {
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/agent/propertyByIdForAgent/2/${category}/${id}`
      );
      const { category: catNorm, listingId, initialData, existingMedia } = mapApiToEditProps(resp.data);
      setMapped({ category: catNorm, listingId, initialData, existingMedia });
    } catch (e) {
      console.error(e);
      alert("Failed to load property.");
    } finally {
      setLoading(false);
    }
  })();
}, [category, id]);

if (loading || !mapped) return <div>Loading…</div>;

return (
  <EditPropertyForm
    agentId={agentId}
    listingId={mapped.listingId}
    category={mapped.category}
    initialData={mapped.initialData}
    existingMedia={mapped.existingMedia}
    apiBase={API_BASE_URL}
  />
);
};

export default EditPropertyPage;
