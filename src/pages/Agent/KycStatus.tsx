import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Upload, AlertCircle, CheckCircle, Clock, XCircle, Edit3, Send } from 'lucide-react';

// --- Configuration ---
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

const AGENT_ID = 4; // Replace with dynamic Agent ID

// --- Types ---
type KycStatusType = 'INAPPLICABLE' | 'PENDING' | 'APPROVED' | 'REJECTED';

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
    kycVerified: KycStatusType;
    // Assuming a rejection reason might be returned if kycVerified is 'REJECTED'
    kycRejectionReason?: string; 
}

// --- Helper Functions ---

const getStatusMeta = (status: KycStatusType) => {
    switch (status) {
        case 'APPROVED':
            return {
                text: 'KYC Registration - Approved',
                icon: <CheckCircle className="w-5 h-5 mr-2 text-white" />,
                className: 'bg-green-500 border-green-700',
                canEdit: false,
            };
        case 'PENDING':
            return {
                text: 'KYC Registration - Approval Pending',
                icon: <Clock className="w-5 h-5 mr-2 text-white" />,
                className: 'bg-yellow-500 border-yellow-700',
                canEdit: false,
            };
        case 'REJECTED':
            return {
                text: 'KYC Registration - Rejected. Please Edit and Resubmit.',
                icon: <XCircle className="w-5 h-5 mr-2 text-white" />,
                className: 'bg-red-500 border-red-700',
                canEdit: true,
            };
        case 'INAPPLICABLE':
        default:
            return {
                text: 'KYC Status Not Found / Inapplicable',
                icon: <AlertCircle className="w-5 h-5 mr-2 text-white" />,
                className: 'bg-gray-500 border-gray-700',
                canEdit: true,
            };
    }
};

const KycStatus: React.FC = () => {
    const [agentDetails, setAgentDetails] = useState<AgentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<AgentResponse>>({});

    const fetchAgentDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<AgentResponse>(`${API_BASE_URL}/agent/getAgentDetails/${AGENT_ID}`);
            setAgentDetails(response.data);
            setFormData(response.data); // Initialize form data with current details
            // Automatically switch to edit mode if rejected
            if (response.data.kycVerified === 'REJECTED') {
                setIsEditing(true);
            } else {
                setIsEditing(false);
            }
        } catch (e) {
            console.error("Failed to fetch agent details:", e);
            setError("Failed to load agent details. Check API connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgentDetails();
    }, [fetchAgentDetails]);

    const statusMeta = getStatusMeta(agentDetails?.kycVerified || 'INAPPLICABLE');
    const isUneditable = !statusMeta.canEdit || !isEditing;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Mock file handling: In a real app, this would involve sending the file
        // to a storage service (like S3) and updating the formData URL/reference.
        const fileName = e.target.files?.[0]?.name;
        if (e.target.name === 'profileImage') {
            setFormData(prev => ({ ...prev, profileImageUrl: fileName ? `uploaded:${fileName}` : prev?.profileImageUrl }));
        } else if (e.target.name === 'aadharCard') {
            setFormData(prev => ({ ...prev, aadharUrl: fileName ? `uploaded:${fileName}` : prev?.aadharUrl }));
        }
        alert(`File selected for ${e.target.name}: ${fileName}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Set loading while submitting
        
        // NOTE: The update endpoint is PUT /updateAgentDetails/{agentId}
        const submissionPayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email, // Assuming email can be updated
            phoneNumber: formData.phoneNumber,
            state: formData.state,
            city: formData.city,
            profileImageUrl: formData.profileImageUrl,
            aadharUrl: formData.aadharUrl,
            // When submitting after rejection, the backend should reset kycVerified to 'PENDING'
        };

        try {
            // Assume the PUT endpoint handles profile/KYC updates
            await axios.put(`${API_BASE_URL}/agent/updateAgentDetails/${AGENT_ID}`, submissionPayload);
            alert("Profile/KYC details updated successfully! Status reset to PENDING.");
            setIsEditing(false);
            fetchAgentDetails(); // Refresh data to show new PENDING status
        } catch (submitError) {
            console.error("Submission error:", submitError);
            setError("Failed to update details. Please check form data and connection.");
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4 md:p-8 text-center text-gray-500">Loading KYC Status...</div>;
    }
    
    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="p-4 rounded-lg border border-red-300 bg-red-100 text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-7 h-7 text-orange-600" /> KYC Registration
            </h2>

            {/* Status Header Bar */}
            <div className={`p-4 mb-8 rounded-xl shadow-lg border-b-4 ${statusMeta.className} flex items-center justify-between text-white`}>
                <div className="flex items-center">
                    {statusMeta.icon}
                    <span className="text-xl font-semibold">{statusMeta.text}</span>
                </div>
                
                {agentDetails?.propaddaVerified && (
                    <span className="px-3 py-1 bg-white text-green-700 font-bold rounded-full text-sm">
                        VERIFIED SELLER
                    </span>
                )}
            </div>

            {/* Rejection Reason (If Applicable) */}
            {agentDetails?.kycVerified === 'REJECTED' && (
                <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800 border border-red-300">
                    <p className="font-semibold mb-1">Reason for Rejection:</p>
                    <p>{agentDetails.kycRejectionReason || "Details were insufficient or did not match records. Please review and re-upload documents."}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-6">
                {/* Personal Details */}
                <h3 className="text-xl font-semibold border-b pb-2 text-orange-500">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <InputField 
                        label="First Name" 
                        name="firstName" 
                        value={formData.firstName || ''} 
                        onChange={handleInputChange} 
                        disabled={isUneditable}
                    />
                    {/* Last Name */}
                    <InputField 
                        label="Last Name" 
                        name="lastName" 
                        value={formData.lastName || ''} 
                        onChange={handleInputChange} 
                        disabled={isUneditable}
                    />
                    {/* Email (Uneditable in most systems) */}
                    <InputField 
                        label="Email" 
                        name="email" 
                        value={formData.email || ''} 
                        icon={<Mail className="w-4 h-4 text-gray-400" />}
                        disabled 
                    />
                    {/* Phone Number */}
                    <InputField 
                        label="Phone Number" 
                        name="phoneNumber" 
                        value={formData.phoneNumber || ''} 
                        icon={<Phone className="w-4 h-4 text-gray-400" />}
                        onChange={handleInputChange} 
                        disabled={isUneditable}
                    />
                    {/* City */}
                    <InputField 
                        label="City" 
                        name="city" 
                        value={formData.city || ''} 
                        icon={<MapPin className="w-4 h-4 text-gray-400" />}
                        onChange={handleInputChange} 
                        disabled={isUneditable}
                    />
                    {/* State */}
                    <InputField 
                        label="State" 
                        name="state" 
                        value={formData.state || ''} 
                        icon={<MapPin className="w-4 h-4 text-gray-400" />}
                        onChange={handleInputChange} 
                        disabled={isUneditable}
                    />
                </div>

                {/* KYC & Documents */}
                <h3 className="text-xl font-semibold border-b pb-2 pt-4 text-orange-500">KYC Documents</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Image / Logo */}
                    <DocumentUploadField
                        label="Profile Image / Logo"
                        name="profileImage"
                        currentUrl={agentDetails?.profileImageUrl}
                        onFileChange={handleFileChange}
                        disabled={isUneditable}
                    />
                    {/* Adhaar Card */}
                    <DocumentUploadField
                        label="Adhaar Card"
                        name="aadharCard"
                        currentUrl={agentDetails?.aadharUrl}
                        onFileChange={handleFileChange}
                        disabled={isUneditable}
                    />
                </div>

                {/* Edit/Submit Buttons */}
                <div className="pt-4 border-t flex justify-end gap-3">
                    {agentDetails?.kycVerified !== 'REJECTED' && statusMeta.canEdit && !isEditing && (
                         <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 border border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition flex items-center"
                        >
                            <Edit3 className="w-5 h-5 mr-2" /> Edit Details
                        </button>
                    )}

                    {statusMeta.canEdit && isEditing && (
                        <>
                            <button
                                type="button"
                                onClick={() => { setIsEditing(false); setFormData(agentDetails || {}); }} // Cancel: revert to original data
                                className="px-6 py-2 border border-gray-400 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition disabled:bg-gray-400 flex items-center"
                            >
                                <Send className="w-5 h-5 mr-2" /> 
                                {loading ? 'Submitting...' : 'Resubmit KYC'}
                            </button>
                        </>
                    )}
                    
                    {/* Show button for approval/pending states, if not editable */}
                    {isUneditable && (
                        <span className="text-gray-500 text-sm italic">
                            Details are locked for Admin review.
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
};

// --- Reusable Form Input Component ---
const InputField: React.FC<{
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

// --- Reusable Document Upload Component ---
const DocumentUploadField: React.FC<{
    label: string;
    name: string;
    currentUrl?: string;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}> = ({ label, name, currentUrl, onFileChange, disabled = false }) => {
    const isUploaded = currentUrl && !currentUrl.startsWith('uploaded:');

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-3">
                <input
                    type="file"
                    id={`file-${name}`}
                    name={name === 'profileImage' ? 'profileImage' : 'aadharCard'} // Ensure correct name for file handling
                    onChange={onFileChange}
                    accept={name === 'aadharCard' ? 'image/*,application/pdf' : 'image/*'}
                    disabled={disabled}
                    className="hidden"
                />
                <label 
                    htmlFor={`file-${name}`} 
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition ${
                        disabled 
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploaded ? 'Change File' : 'Upload File'}
                </label>
                
                <span className={`text-sm ${isUploaded ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                    {isUploaded ? 'Uploaded' : (currentUrl && currentUrl.startsWith('uploaded:') ? currentUrl.replace('uploaded:', 'New: ') : 'No file')}
                </span>
            </div>
        </div>
    );
};


export default KycStatus;