// src/components/AddressSelector.tsx
import React, { useState } from "react";
import axios from "axios";
import { MapPin, Building2, Map, Home, Landmark, KeySquare, ToggleRight, ToggleLeft, MapPinHouse, ArrowDownToLine, LandPlot } from "lucide-react";

export interface StateItem {
  iso2: string; // e.g. "MH"
  name: string;
  // other fields from API are ignored
}

export interface CityItem {
  name: string;
}

export interface PostOffice {
  Name: string;
  District: string;
  State: string;
}

interface Props {
  stateValue: string;
  cityValue: string;
  localityValue: string;
  onChange: (changes: {
    state?: string;
    city?: string;
    locality?: string;
    address?: string;
    pincode?: number;
    nearbyPlace?: string;
  }) => void; // pincode is now a number (or undefined)
}

const CSC_API_KEY = (import.meta.env.VITE_CSC_API_KEY as string) || "";

// --- Local UI styles for consistent look ---
const INPUT_CLASS =
  "w-full bg-white border border-gray-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition";
const SELECT_CLASS = INPUT_CLASS;
const TOGGLE_CLASS =
  "inline-flex items-center gap-2 text-sm text-gray-700";


const AddressSelector: React.FC<Props> = ({ stateValue, cityValue, localityValue, onChange }) => {
  const [pincode, setPincode] = useState<string>(""); // keep input UX as string to allow partial typing
  const [isManual, setIsManual] = useState<boolean>(false);

  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);

  const [addressText, setAddressText] = useState<string>(""); // manual address textbox
  const [nearbyPlace, setNearbyPlace] = useState<string>(""); // manual nearby place textbox

  const [selectedStateIso2, setSelectedStateIso2] = useState<string>("");

  // Load post offices by pincode (postalpincode.in flow)
  const handleLoad = async () => {
    if (!pincode) return alert("Enter pincode");
    try {
      const res = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = res.data?.[0];
      if (data && data.Status === "Success") {
        const poList: PostOffice[] = data.PostOffice || [];
        setPostOffices(poList);
        if (poList.length > 0) {
          // send pincode as number to parent for DB storage
          onChange({
            state: poList[0].State,
            city: poList[0].District,
            locality: poList[0].Name,
            pincode: Number(pincode),
            nearbyPlace: "", 
            address: "" 
          });
        } else {
          alert("No post offices found for this pincode");
        }
      } else {
        alert("Invalid Pincode");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load pincode data");
    }
  };

  // Toggle manual mode -> if enabling manual, fetch states from CSC API
  const handleManualToggle = async () => {
    const enteringManual = !isManual;
    setIsManual(enteringManual);

    if (enteringManual) {
      if (!CSC_API_KEY) {
        alert("CSC API key not set. Please set VITE_CSC_API_KEY in .env");
        // set manual but clear parent selections (pincode undefined)
        onChange({ state: "", city: "", locality: "", pincode: undefined, nearbyPlace: "", address: "" });
        setCities([]);
        setPostOffices([]);
        return;
      }

      try {
        const res = await axios.get<StateItem[]>("https://api.countrystatecity.in/v1/countries/IN/states", {
          headers: { "X-CSCAPI-KEY": CSC_API_KEY },
        });
        const stateList: StateItem[] = (res.data || []).map((s: any) => ({
          iso2: s.iso2,
          name: s.name,
        }));
        setStates(stateList);
        // clear current selections so user must pick; pincode cleared to undefined
        onChange({ state: "", city: "", locality: "", pincode: undefined, nearbyPlace: "", address: "" });
        setCities([]);
        setPostOffices([]);
        setSelectedStateIso2("");
      } catch (err) {
        console.error(err);
        alert("Failed to load states from countrystatecity.in (check API key & network).");
      }
    } else {
      // switching back to pincode mode: clear manual lists and clear pincode (undefined)
      setStates([]);
      setCities([]);
      setPostOffices([]);
      onChange({ state: "", city: "", locality: "", pincode: undefined, nearbyPlace: "", address: "" });
      setSelectedStateIso2("");
    }
  };

  // When user selects a state (manual) fetch cities for that state's iso2
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const iso2 = e.target.value;
    setSelectedStateIso2(iso2);
    const stateObj = states.find((s) => s.iso2 === iso2);
    const stateName = stateObj ? stateObj.name : "";

    // update parent with state name and clear city/locality; clear pincode as undefined in manual flow
    onChange({ state: stateName, city: "", locality: "", pincode: undefined, nearbyPlace: "", address: ""  });

    if (!iso2) {
      setCities([]);
      return;
    }

    if (!CSC_API_KEY) {
      alert("CSC API key not set. Please set VITE_CSC_API_KEY in .env");
      return;
    }

    try {
      const res = await axios.get<any[]>(
        `https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`,
        { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
      );
      const cityList: CityItem[] = (res.data || []).map((c: any) => ({ name: c.name }));
      setCities(cityList);
    } catch (err) {
      console.error(err);
      alert("Failed to load cities for selected state (check API key & network).");
    }
  };

  // City change handler (manual)
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    onChange({ city: cityName, locality: "" });
  };

  // Locality/manual input change
  const handleLocalityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ locality: e.target.value });
  };

  // handle manual address textbox change and propagate to parent
  const handleAddressTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressText(e.target.value);
    onChange({ address: e.target.value });
  };

  // handle manual nearby place textbox change and propagate to parent
  const handleNearbyPlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNearbyPlace(e.target.value);
    onChange({ nearbyPlace: e.target.value });
  };

  // handle manual pincode input (for CSC/manual flow) and propagate numeric pincode (or undefined)
  const handleManualPincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, ""); // keep only digits
    setPincode(digits); // keep as string for input UX
    const num = digits ? Number(digits) : undefined; // parse to number or undefined
    onChange({ pincode: num });
  };

  return (
  <div className="space-y-5">
    {/* Row: Pincode | Load | Manual toggle */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
      {/* Pincode */}
      <div className="flex items-center gap-2">
        
        {!isManual ? (
          <input
            className={INPUT_CLASS}
            type="text"
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          />
        ) : (
          <input
            type="text"
            onChange={handleManualPincodeChange}
            className={INPUT_CLASS}
            placeholder="Enter Pincode"
          />
        )}
      </div>

      {/* Load button (subtle; disabled in manual mode) */}
      <div className="flex md:justify-left">
        <button
          type="button"
          onClick={handleLoad}
          disabled={isManual}
          className={`flex items-center justify-center gap-1 rounded border px-3 py-2 text-sm transition
            ${isManual
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "border-orange-400 bg-orange-50 text-orange-600 hover:bg-orange-100"
            }`}
          aria-disabled={isManual}
        >
          <ArrowDownToLine className="w-4 h-4" />
          Load
        </button>
      </div>

      {/* Manual toggle with icon */}
      <div className="flex md:justify-end">
        <button
          type="button"
          onClick={handleManualToggle}
          aria-pressed={isManual}
          className="inline-flex items-center gap-2 text-[15px] text-gray-700 hover:text-gray-900 transition"
        >
          {isManual ? (
            <ToggleRight className="w-12 h-8 text-orange-600" />
          ) : (
            <ToggleLeft className="w-12 h-8 text-gray-400" />
          )}
          <span>Enter Address Manually</span>
        </button>
      </div>
    </div>

    {/* State / City / Locality */}
    <div className="grid gap-3 md:grid-cols-3">
      {/* State */}
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
          <LandPlot className="w-3 h-3 text-orange-500" /> State
        </label>
        {isManual ? (
          <select
            value={selectedStateIso2}
            onChange={handleStateChange}
            className={SELECT_CLASS}
          >
            <option value="">-- Select State --</option>
            {states.map((s) => (
              <option key={s.iso2} value={s.iso2}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={stateValue}
            disabled
            className={`${INPUT_CLASS} bg-gray-100 text-gray-500 cursor-not-allowed`}
            placeholder="State"
          />
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
          <Map className="w-3 h-3 text-orange-500" /> City
        </label>
        {isManual ? (
          <select value={cityValue} onChange={handleCityChange} className={SELECT_CLASS}>
            <option value="">-- Select City --</option>
            {cities.map((c, idx) => (
              <option key={idx} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={cityValue}
            disabled
            className={`${INPUT_CLASS} bg-gray-100 text-gray-500 cursor-not-allowed`}
            placeholder="City"
          />
        )}
      </div>

      {/* Locality */}
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
          <MapPinHouse className="w-3 h-3 text-orange-500" /> Locality
        </label>
        {isManual ? (
          <input
            type="text"
            value={localityValue}
            onChange={handleLocalityChange}
            className={INPUT_CLASS}
            placeholder="Enter Locality"
          />
        ) : (
          <select value={localityValue} onChange={handleLocalityChange} className={SELECT_CLASS}>
            <option value="">-- Select Locality --</option>
            {postOffices.map((po) => (
              <option key={po.Name} value={po.Name}>
                {po.Name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>

    {/* Address & Nearby Place */}
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
          <Home className="w-3 h-3 text-orange-500" /> Address
        </label>
        <input
          type="text"
          value={addressText}
          onChange={handleAddressTextChange}
          className={INPUT_CLASS}
          placeholder="House/Street/Area"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 text-gray-600 flex items-center gap-1">
          <Landmark className="w-3 h-3 text-orange-500" /> Nearby Place
        </label>
        <input
          type="text"
          value={nearbyPlace}
          onChange={handleNearbyPlaceChange}
          className={INPUT_CLASS}
          placeholder="Landmark"
        />
      </div>
    </div>
  </div>
);
};

export default AddressSelector;
