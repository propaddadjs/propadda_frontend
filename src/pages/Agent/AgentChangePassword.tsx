import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Send, AlertCircle, CheckCircle } from 'lucide-react';

// --- Configuration ---
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const AGENT_ID = 1; // Replace with dynamic Agent ID from context

// --- Types (Updated to match your exact DTO structure) ---
interface PasswordUpdateRequest {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string; // Added the required field
}

const AgentChangePassword: React.FC = () => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '', // Maps to confirmNewPassword
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setStatus(null);
    };

    const validateForm = (): boolean => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setStatus({ message: "All password fields are required.", type: 'error' });
            return false;
        }
        if (passwords.new.length < 8) {
            setStatus({ message: "New password must be at least 8 characters long.", type: 'error' });
            return false;
        }
        if (passwords.new !== passwords.confirm) {
            setStatus({ message: "New password and confirmation do not match.", type: 'error' });
            return false;
        }
        if (passwords.current === passwords.new) {
            setStatus({ message: "New password cannot be the same as the current password.", type: 'error' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // FIX: The payload now includes all three fields matching the DTO
        const payload: PasswordUpdateRequest = {
            currentPassword: passwords.current,
            newPassword: passwords.new,
            confirmNewPassword: passwords.confirm, 
        };

        try {
            const url = `${API_BASE_URL}/agent/updateAgentPassword/${AGENT_ID}`;
            await axios.put(url, payload);

            setStatus({ message: "Password updated successfully!", type: 'success' });
            setPasswords({ current: '', new: '', confirm: '' });

        } catch (error) {
            console.error("Password update failed:", error);
            setStatus({ message: "Failed to change password. Please check your current password.", type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const StatusMessage: React.FC<{ status: 'success' | 'error', message: string }> = ({ status, message }) => {
        const isSuccess = status === 'success';
        return (
            <div className={`p-4 mb-6 rounded-lg border flex items-center gap-2 ${
                isSuccess 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-red-100 border-red-300 text-red-800'
            }`}>
                {isSuccess ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{message}</p>
            </div>
        );
    };

    return (
        <div className="max-w-xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Lock className="w-7 h-7 text-orange-600" /> Change Password
            </h2>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                
                {status && <StatusMessage status={status.type} message={status.message} />}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Current Password */}
                    <div>
                        <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            id="current"
                            name="current"
                            value={passwords.current}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter current password"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label htmlFor="new" className="block text-sm font-medium text-gray-700 mb-1">New Password (Min 8 characters)</label>
                        <input
                            type="password"
                            id="new"
                            name="new"
                            value={passwords.new}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter new password"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                        />
                    </div>

                    {/* Confirm New Password (Maps to confirmNewPassword in DTO) */}
                    <div>
                        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirm"
                            name="confirm"
                            value={passwords.confirm}
                            onChange={handleInputChange}
                            required
                            placeholder="Confirm new password"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Updating...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Change Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgentChangePassword;