// src/components/AmenitiesPanel.tsx
import {
  Snowflake, PawPrint, Droplet, Flame, UtensilsCrossed, Package, Wind,
  FlameKindling, Users, Thermometer, Waves, Shirt, CloudFog, Trees,
  CloudRain, Dumbbell, ArrowUpDown, Droplets, DoorOpen, Compass,
  type LucideIcon,
  CornerDownRight,
  Accessibility,
  ShieldCheck,
  FireExtinguisher,
  Store,
  StoreIcon,
  Archive,
  WashingMachine,
  Heater,
  ToolCase,
  Drill,
  BadgeCheck,
  DoorClosedLocked,
  PanelRightClose,
  Siren
} from "lucide-react";
import React from "react";

type FormSetter = <K extends keyof any>(updater: (prev: any) => any) => void;

// Fields you toggle in this panel (booleans only)
type AmenityField =
  | "centerCooling" | "petFriendly" | "waterPurifier" | "fireAlarm" | "modularKitchen"
  | "storage" | "dryer" | "gasPipeline" | "maintenanceStaff" | "heating"
  | "pool" | "laundry" | "sauna" | "park" | "rainWaterHarvesting"
  | "gym" | "elevator" | "dishwasher" | "emergencyExit" | "vastuCompliant"
  // other sections:
  | "poojaRoom" | "studyRoom" | "servantRoom" | "storeRoom"
  | "highCeilingHeight" | "falseCeilingLighting" | "internetConnectivity" | "centrallyAirConditioned"
  | "securityFireAlarm" | "recentlyRenovated" | "privateGardenTerrace" | "naturalLight"
  | "airyRooms" | "intercomFacility" | "spaciousInteriors"
  | "fitnessCenter" | "swimmingPool" | "clubhouseCommunityCenter" | "securityPersonnel" | "lifts"
  | "separateEntryForServantRoom" | "noOpenDrainageAround" | "bankAttachedProperty" | "lowDensitySociety"
  | "municipalCorporation" | "borewellTank" | "water24x7"
  | "overlookingPool" | "overlookingParkGarden" | "overlookingClub" | "overlookingMainRoad"
  | "inGatedSociety" | "cornerProperty" | "petFriendlySociety" | "wheelchairFriendly"
  | "closeToMetroStation" | "closeToSchool" | "closeToHospital" | "closeToMarket"
  | "closeToRailwayStation" | "closeToAirport" | "closeToMall" | "closeToHighway";

interface AmenitiesPanelProps {
  formData: any;
  setFormData: (updater: (prev: any) => any) => void;
}

interface CheckboxItemProps {
  label: string;
  field: AmenityField;        // ✅ now a string union of your own fields
  icon?: LucideIcon;          // optional, so you can reuse without icon
}

/**
 * AmenitiesPanel
 * - Renders UI groups according to ResidentialPropertyAmenities entity
 * - All fields are optional (no required validation)
 * - Controlled: reads values from formData and calls setFormData to update
 *
 * Usage:
 * <AmenitiesPanel formData={formData} setFormData={setFormData} />
 */
const AmenitiesPanel: React.FC<AmenitiesPanelProps> = ({ formData, setFormData }) => {
  // helper to toggle boolean fields
  const toggle = (key: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: !Boolean(prev[key]) }));
  };

  // helper to set explicit boolean
  const setBool = (key: string, value: boolean) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  // pill toggle (visual tag) used for groups that look like chips in screenshot
  // const Pill: React.FC<{ label: string; field: string }> = ({ label, field }) => {
  //   const active = Boolean(formData[field]);
  //   return (
  //     <button
  //       type="button"
  //       onClick={() => toggle(field)}
  //       aria-pressed={active}
  //       className={`text-sm px-3 py-1 rounded-full border transition-colors duration-150 focus:outline-none ${
  //         active
  //           ? "bg-themeOrange text-white border-themeOrange"
  //           : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
  //       }`}
  //     >
  //       {label}
  //     </button>
  //   );
  // };

  // standard checkbox row component
  // const CheckboxItem: React.FC<{ label: string; field: string }> = ({ label, field }) => {
  //   return (
  //     <label className="inline-flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
  //       <input
  //         type="checkbox"
  //         checked={Boolean(formData[field])}
  //         onChange={() => toggle(field)}
  //         className="form-checkbox h-4 w-4 border-gray-300 rounded accent-orange-600"
  //       />
  //       <span>{label}</span>
  //     </label>
  //   );
  // };

  const Pill: React.FC<{ label: string; field: AmenityField }> = ({ label, field }) => {
  const active = Boolean((formData as any)[field]);
  return (
    <button
      type="button"
      onClick={() => setFormData((prev: any) => ({ ...prev, [field]: !active }))}
      aria-pressed={active}
      className={`text-sm px-3 py-1 rounded-full border transition-colors duration-150 focus:outline-none ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
};

  const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, field, icon: Icon }) => {
  const checked = Boolean((formData as any)[field]);

  return (
    <label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 transition">
      <input
        type="checkbox"
        name={field as string}
        checked={checked}
        onChange={(e) =>
          setFormData((prev: any) => ({
            ...prev,
            [field]: e.target.checked,
          }))
        }
        className="h-4 w-4 rounded border-gray-300 accent-orange-600"
      />
      <span className="text-sm text-slate-700">{label}</span>
      {Icon ? <Icon className="w-4 h-4 text-orange-500" /> : null}
    </label>
  );
};


  return (
    <div className="mt-6 space-y-6">
      {/* Section: Property Features (checkbox grid) */}
      {/* <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Property Features</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-themeOrange">
          <CheckboxItem label="Center Cooling" field="centerCooling" />
          <CheckboxItem label="Pet Friendly" field="petFriendly" />
          <CheckboxItem label="Water Purifier" field="waterPurifier" />
          <CheckboxItem label="Fire Alarm" field="fireAlarm" />
          <CheckboxItem label="Modern Kitchen" field="modularKitchen" />
          <CheckboxItem label="Storage" field="storage" />
          <CheckboxItem label="Dryer" field="dryer" />
          <CheckboxItem label="Piped-gas" field="gasPipeline" />
          <CheckboxItem label="Maintenance Staff" field="maintenanceStaff" />
          <CheckboxItem label="Heating" field="heating" />
          <CheckboxItem label="Pool" field="pool" />
          <CheckboxItem label="Laundry" field="laundry" />
          <CheckboxItem label="Sauna" field="sauna" />
          <CheckboxItem label="Park" field="park" />
          <CheckboxItem label="Rain Water Harvesting" field="rainWaterHarvesting" />
          <CheckboxItem label="Gym" field="gym" />
          <CheckboxItem label="Elevator" field="elevator" />
          <CheckboxItem label="Dish Washer" field="dishwasher" />
          <CheckboxItem label="Emergency Exit" field="emergencyExit" />
          <CheckboxItem label="Vastu Compliant" field="vastuCompliant" />
        </div>
      </section> */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Property Features</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
          <CheckboxItem label="Center Cooling" field="centerCooling" icon={Snowflake} />
          <CheckboxItem label="Pet Friendly" field="petFriendly" icon={PawPrint} />
          <CheckboxItem label="Water Purifier" field="waterPurifier" icon={Droplets} />
          <CheckboxItem label="Fire Alarm" field="fireAlarm" icon={Siren} />
          <CheckboxItem label="Modular Kitchen" field="modularKitchen" icon={UtensilsCrossed} />
          <CheckboxItem label="Storage" field="storage" icon={Archive} />
          <CheckboxItem label="Dryer" field="dryer" icon={Wind} />
          <CheckboxItem label="Piped-gas" field="gasPipeline" icon={FlameKindling} />
          <CheckboxItem label="Maintenance Staff" field="maintenanceStaff" icon={Drill} />
          <CheckboxItem label="Heating" field="heating" icon={Heater} />
          <CheckboxItem label="Pool" field="pool" icon={Waves} />
          <CheckboxItem label="Laundry" field="laundry" icon={Shirt} />
          <CheckboxItem label="Sauna" field="sauna" icon={CloudFog} /> 
          <CheckboxItem label="Park" field="park" icon={Trees} />
          <CheckboxItem label="Rain Water Harvesting" field="rainWaterHarvesting" icon={CloudRain} />
          <CheckboxItem label="Gym" field="gym" icon={Dumbbell} />
          <CheckboxItem label="Elevator" field="elevator" icon={ArrowUpDown} />
          <CheckboxItem label="Dish Washer" field="dishwasher" icon={WashingMachine} />
          <CheckboxItem label="Emergency Exit" field="emergencyExit" icon={DoorOpen} />
          <CheckboxItem label="Vastu Compliant" field="vastuCompliant" icon={BadgeCheck} />
        </div>
      </section>

      {/* Section: Other rooms (pill style) */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Other rooms <span className="text-sm text-gray-500">(Optional)</span></h4>
        <div className="flex flex-wrap gap-2">
          <Pill label="Pooja Room" field="poojaRoom" />
          <Pill label="Study Room" field="studyRoom" />
          <Pill label="Servant Room" field="servantRoom" />
          <Pill label="Store Room" field="storeRoom" />
        </div>
      </section>

      {/* Section: Property features (chips) */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Property Features (extra)</h4>
        <div className="flex flex-wrap gap-2">
          <Pill label="High Ceiling Height" field="highCeilingHeight" />
          <Pill label="False Ceiling Lighting" field="falseCeilingLighting" />
          <Pill label="Internet / Wi-fi connectivity" field="internetConnectivity" />
          <Pill label="Centrally Air Conditioned" field="centrallyAirConditioned" />
          <Pill label="Security / Fire Alarm" field="securityFireAlarm" />
          <Pill label="Recently Renovated" field="recentlyRenovated" />
          <Pill label="Private Garden / Terrace" field="privateGardenTerrace" />
          <Pill label="Natural Light" field="naturalLight" />
          <Pill label="Airy Rooms" field="airyRooms" />
          <Pill label="Intercom Facility" field="intercomFacility" />
          <Pill label="Spacious Interiors" field="spaciousInteriors" />
        </div>
      </section>

      {/* Section: Society/Building feature */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Society / Building feature</h4>
        <div className="flex flex-wrap gap-2">
          <Pill label="Fitness Centre / GYM" field="fitnessCenter" />
          <Pill label="Swimming Pool" field="swimmingPool" />
          <Pill label="Club house / Community Center" field="clubhouseCommunityCenter" />
          <Pill label="Security Personnel" field="securityPersonnel" />
          <Pill label="Lift(s)" field="lifts" />
        </div>
      </section>

      {/* Section: Additional features */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Additional Features</h4>
        <div className="flex flex-wrap gap-2">
          <Pill label="Separate entry for servant room" field="separateEntryForServantRoom" />
          <Pill label="No open drainage around" field="noOpenDrainageAround" />
          <Pill label="Bank Attached Property" field="bankAttachedProperty" />
          <Pill label="Low Density Society" field="lowDensitySociety" />
        </div>
      </section>

      {/* Section: Water Source */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Water Source</h4>
        <div className="flex flex-wrap gap-2">
          <Pill label="Municipal corporation" field="municipalCorporation" />
          <Pill label="Borewell / Tank" field="borewellTank" />
          <Pill label="24x7 Water" field="water24x7" />
        </div>
      </section>

      {/* Section: Overlooking */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Overlooking</h4>
        <div className="flex flex-wrap gap-2">
          <Pill label="Pool" field="overlookingPool" />
          <Pill label="Park / Garden" field="overlookingParkGarden" />
          <Pill label="Club" field="overlookingClub" />
          <Pill label="Main Road" field="overlookingMainRoad" />
        </div>
      </section>

      {/* Section: Other Features (checkboxes) */}
      {/* <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Other Features</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CheckboxItem label="In a gated society" field="inGatedSociety" />
          <CheckboxItem label="Corner Property" field="cornerProperty" />
          <CheckboxItem label="Pet Friendly (Society)" field="petFriendlySociety" />
          <CheckboxItem label="Wheelchair friendly" field="wheelchairFriendly" />
        </div>
      </section> */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Other Features</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CheckboxItem label="In a gated society" field="inGatedSociety" icon={DoorClosedLocked} />
          <CheckboxItem label="Corner Property" field="cornerProperty" icon={PanelRightClose} />
          <CheckboxItem label="Pet Friendly (Society)" field="petFriendlySociety" icon={PawPrint} />
          <CheckboxItem label="Wheelchair friendly" field="wheelchairFriendly" icon={Accessibility} />
        </div>
      </section>

      {/* Section: Location Advantages */}
      <section>
        <h4 className="text-base font-semibold text-slate-800 mb-3">Location Advantages</h4>
        <div className="flex flex-wrap gap-2">
          <Pill label="Close to Metro Station" field="closeToMetroStation" />
          <Pill label="Close to School" field="closeToSchool" />
          <Pill label="Close to Hospital" field="closeToHospital" />
          <Pill label="Close to Market" field="closeToMarket" />
          <Pill label="Close to Railway Station" field="closeToRailwayStation" />
          <Pill label="Close to Airport" field="closeToAirport" />
          <Pill label="Close to Mall" field="closeToMall" />
          <Pill label="Close to Highway" field="closeToHighway" />
        </div>
      </section>
    </div>
  );
};

export default AmenitiesPanel;
