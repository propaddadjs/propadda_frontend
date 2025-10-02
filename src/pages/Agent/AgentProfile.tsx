import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Edit3, Send, Briefcase, Upload, AlertCircle, Loader2 } from 'lucide-react';

// --- Configuration ---
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const AGENT_ID = 4; // Replace with dynamic Agent ID

// NOTE: Fetch CSC_API_KEY from environment variables (e.g., VITE_CSC_API_KEY in Vite)
const CSC_API_KEY = import.meta.env.VITE_CSC_API_KEY || "YOUR_CSC_API_KEY_HERE"; 

// --- Types ---
interface AgentResponse {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    state: string;
    city: string;
    role: string;
    profileImageUrl: string;
    agentReraNumber?: string;
    propaddaVerified: boolean;
    aadharUrl?: string;
    kycVerified: 'INAPPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    address?: string; // Included address from PDF/previous context
}

interface StateItem {
    iso2: string;
    name: string;
}

interface CityItem {
    name: string;
}

const AgentProfile: React.FC = () => {
    const [originalDetails, setOriginalDetails] = useState<AgentResponse | null>(null);
    const [formData, setFormData] = useState<Partial<AgentResponse>>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // --- State/City API States ---
    const [states, setStates] = useState<StateItem[]>([]);
    const [cities, setCities] = useState<CityItem[]>([]);
    const [selectedStateIso2, setSelectedStateIso2] = useState<string>('');
    const [loadingGeo, setLoadingGeo] = useState(false);


    // --- API Handlers ---

    // 1. Fetch Agent Profile Details (Primary Data)
    const fetchAgentDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<AgentResponse>(`${API_BASE_URL}/agent/getAgentDetails/${AGENT_ID}`);
            const data = response.data;
            setOriginalDetails(data);
            setFormData(data); 

            // Find the ISO2 code for the agent's current state to pre-populate cities
            const foundState = states.find(s => s.name === data.state);
            if (foundState) {
                setSelectedStateIso2(foundState.iso2);
                // No need to call fetchCities here, useEffect handles it after setting selectedStateIso2
            } else {
                // If state is set in profile but not in the list (e.g., first load), fetch its ISO2 and cities.
                // This scenario requires more complex logic, but we prioritize initial state fetch.
                setSelectedStateIso2(''); // Reset to ensure state is selected dynamically
            }

        } catch (e) {
            console.error("Failed to fetch agent details:", e);
            setError("Failed to load profile details. Check API connection.");
        } finally {
            setLoading(false);
        }
    }, [states]);

    // 2. Fetch States from external API
    const fetchStates = useCallback(async () => {
        if (!CSC_API_KEY || CSC_API_KEY === "YOUR_CSC_API_KEY_HERE") {
            setError("CSC API key is required to load states. Please set VITE_CSC_API_KEY.");
            return;
        }
        setLoadingGeo(true);
        try {
            const res = await axios.get<StateItem[]>("https://api.countrystatecity.in/v1/countries/IN/states", {
                headers: { "X-CSCAPI-KEY": CSC_API_KEY },
            });
            const stateList: StateItem[] = (res.data || []).map((s: any) => ({
                iso2: s.iso2,
                name: s.name,
            }));
            setStates(stateList);
            
        } catch (err) {
            console.error("Failed to load states:", err);
            setError("Failed to load states from external API.");
        } finally {
            setLoadingGeo(false);
        }
    }, []);

    // 3. Fetch Cities for a selected state
    const fetchCities = useCallback(async (iso2: string) => {
        if (!CSC_API_KEY || !iso2) {
            setCities([]);
            return;
        }
        setLoadingGeo(true);
        try {
            const res = await axios.get<any[]>(
                `https://api.countrystatecity.in/v1/countries/IN/states/${iso2}/cities`,
                { headers: { "X-CSCAPI-KEY": CSC_API_KEY } }
            );
            const cityList: CityItem[] = (res.data || []).map((c: any) => ({ name: c.name }));
            setCities(cityList);
        } catch (err) {
            console.error("Failed to load cities:", err);
            setError("Failed to load cities for selected state.");
            setCities([]);
        } finally {
            setLoadingGeo(false);
        }
    }, []);

    // --- Effect Hooks ---

    // Load states on initial mount
    useEffect(() => {
        fetchStates();
    }, [fetchStates]);

    // Load agent details once states are loaded
    useEffect(() => {
        if (states.length > 0 && !originalDetails) {
            fetchAgentDetails();
        }
    }, [states, originalDetails, fetchAgentDetails]);

    // Load cities if a state ISO2 is set
    useEffect(() => {
        if (selectedStateIso2) {
            fetchCities(selectedStateIso2);
        }
    }, [selectedStateIso2, fetchCities]);


    // --- Form Handlers ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const iso2 = e.target.value;
        const stateObj = states.find((s) => s.iso2 === iso2);
        const stateName = stateObj ? stateObj.name : "";

        setSelectedStateIso2(iso2);
        setCities([]); // Clear cities when state changes

        setFormData(prev => ({ 
            ...prev, 
            state: stateName, 
            city: "" // Clear city name in form data
        }));
        
        // fetchCities will run via the useEffect hook for selectedStateIso2
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityName = e.target.value;
        setFormData(prev => ({ ...prev, city: cityName }));
    };

    // FIX: Define handleFileChange here
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Mock file handling: In a real app, this would involve sending the file
        // to a storage service (like S3) and updating the formData URL/reference.
        const fileName = e.target.files?.[0]?.name;
        if (fileName) {
            // Mocking the update
            setFormData(prev => ({ ...prev, profileImageUrl: `new_upload:${fileName}` }));
            setSuccessMessage(`New image selected: ${fileName}. Click 'Save Edits' to finalize.`);
        }
    };
    // END FIX

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        if (!formData.firstName || !formData.phoneNumber || !formData.city || !formData.state) {
            setError("Please fill all required fields (marked with *).");
            setIsSubmitting(false);
            return;
        }

        const submissionPayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email, 
            phoneNumber: formData.phoneNumber,
            state: formData.state,
            city: formData.city,
            agentReraNumber: formData.agentReraNumber,
            profileImageUrl: formData.profileImageUrl,
            address: formData.address,
        };

        try {
            await axios.put(`${API_BASE_URL}/agent/updateAgentDetails/${AGENT_ID}`, submissionPayload);
            setSuccessMessage("Profile updated successfully!");
            await fetchAgentDetails(); 
        } catch (submitError) {
            console.error("Profile update failed:", submitError);
            setError("Failed to save edits. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-4 md:p-8 text-center text-gray-500">Loading Profile...</div>;
    }
    
    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Edit3 className="w-7 h-7 text-orange-600" /> Manage Profile
            </h2>

            {successMessage && (
                <div className="p-4 mb-6 rounded-lg bg-green-100 text-green-800 border border-green-300">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800 border border-red-300">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-6">
                
                {/* Profile Image / Logo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-4 border-b border-gray-100">
                    <img 
                        src={formData.profileImageUrl && !formData.profileImageUrl.startsWith('new_upload:')
                            ? formData.profileImageUrl
                            : "https://placehold.co/100x100/eeeeee/333333?text=Logo"} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image / Logo</label>
                        <input
                            type="file"
                            id="profileImageUpload"
                            name="profileImage"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <label 
                            htmlFor="profileImageUpload" 
                            className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition bg-orange-500 text-white hover:bg-orange-600"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Change Image
                        </label>
                    </div>
                </div>

                {/* --- Form Inputs --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <ProfileInputField 
                        label="First Name*" 
                        name="firstName" 
                        value={formData.firstName || ''} 
                        onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void} 
                    />
                    {/* Last Name */}
                    <ProfileInputField 
                        label="Last Name*" 
                        name="lastName" 
                        value={formData.lastName || ''} 
                        onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void} 
                    />
                    {/* Email (Uneditable) */}
                    <ProfileInputField 
                        label="Email*" 
                        name="email" 
                        value={formData.email || ''} 
                        icon={<Mail className="w-4 h-4 text-gray-400" />}
                        disabled 
                    />
                    {/* Phone Number */}
                    <ProfileInputField 
                        label="Phone Number*" 
                        name="phoneNumber" 
                        value={formData.phoneNumber || ''} 
                        icon={<Phone className="w-4 h-4 text-gray-400" />}
                        onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void} 
                    />
                    {/* RERA Number */}
                    <ProfileInputField 
                        label="RERA Number" 
                        name="agentReraNumber" 
                        value={formData.agentReraNumber || ''} 
                        icon={<Briefcase className="w-4 h-4 text-gray-400" />}
                        onChange={handleInputChange as (e: React.ChangeEvent<HTMLInputElement>) => void} 
                    />
                    {/* Address */}
                    <ProfileTextareaField 
                        label="Address*" 
                        name="address" 
                        value={formData.address || ''} 
                        onChange={handleInputChange as (e: React.ChangeEvent<HTMLTextAreaElement>) => void} 
                    />
                    
                    {/* State Dropdown (Dynamic) */}
                    <SelectField
                        label="State*"
                        name="state"
                        // Display the fetched state name, but control by ISO2 for API calls
                        value={selectedStateIso2 || (formData.state && states.find(s => s.name === formData.state)?.iso2) || ''}
                        onChange={handleStateChange}
                        options={states.map(s => ({ value: s.iso2, label: s.name }))}
                        placeholder={loadingGeo ? 'Loading States...' : 'Select State'}
                        disabled={loadingGeo || states.length === 0}
                        icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    />
                    
                    {/* City Dropdown (Dynamic) */}
                    <SelectField
                        label="City*"
                        name="city"
                        value={formData.city || ''}
                        onChange={handleCityChange}
                        options={cities.map(c => ({ value: c.name, label: c.name }))}
                        placeholder={loadingGeo ? 'Loading Cities...' : 'Select City'}
                        disabled={loadingGeo || !selectedStateIso2 || cities.length === 0}
                        icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    />

                    {/* Placeholder for Dealing properties in* (Uneditable for simplicity) */}
                    {/* <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dealing properties in* (City/Locality)</label>
                        <textarea
                            rows={2}
                            value="Areas agent currently serves..."
                            disabled
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed resize-none"
                        />
                    </div> */}
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition disabled:bg-gray-400 flex items-center"
                    >
                        <Send className="w-5 h-5 mr-2" /> 
                        {isSubmitting ? 'Saving...' : 'Save Edits'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Reusable Profile Input Component ---
const ProfileInputField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    icon?: React.ReactNode;
}> = ({ label, name, value, onChange, disabled = false, icon }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative flex items-center">
            {icon && <div className="absolute left-3 text-gray-400">{icon}</div>}
            <input
                id={name}
                name={name}
                type="text"
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm ${
                    disabled 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                } ${icon ? 'pl-10' : ''}`}
            />
        </div>
    </div>
);

// --- Reusable Profile Textarea Component (for Address) ---
const ProfileTextareaField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
}> = ({ label, name, value, onChange, disabled = false }) => (
    <div className="md:col-span-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            rows={3}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm resize-none ${
                disabled 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500'
            }`}
        />
    </div>
);


// --- Reusable Select Field Component (for State/City) ---
const SelectField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    disabled: boolean;
    icon: React.ReactNode;
}> = ({ label, name, value, onChange, options, placeholder, disabled, icon }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative flex items-center">
            {icon && <div className="absolute left-3 text-gray-400 z-10">{icon}</div>}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm appearance-none pr-10 ${
                    disabled 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500'
                } ${icon ? 'pl-10' : ''}`}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {disabled && name === 'city' && (
                 <Loader2 className="w-4 h-4 absolute right-3 text-gray-500 animate-spin" />
            )}
        </div>
    </div>
);

export default AgentProfile;