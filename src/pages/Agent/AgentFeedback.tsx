import React, { useState } from "react";
import axios from "axios";
import { Send, MessageSquare, Star } from "lucide-react";

// --- Configuration ---
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const AGENT_ID = 1; // Replace with dynamic Agent ID

// --- Data Structure ---
const FEEDBACK_CATEGORIES_MAP = {
  'Website Usability': ['Navigation', 'Design Aesthetics', 'Responsiveness', 'Speed/Performance'],
  'Property Posting Experience': ['Form Clarity', 'Media Upload Flow', 'Location Pinning', 'Preview Accuracy'],
  'Agent Panel Features': ['Dashboard Metrics', 'Listings Table Filters', 'KYC Status View', 'Profile Management'],
  'Support & Services': ['Customer Service Interaction', 'Photoshoot Quality', 'Graphics Request Process', 'Response Time'],
  'Suggestions for Improvement': ['New Feature Idea', 'Existing Feature Modification', 'Platform Suggestion'],
  'Overall Experience': ['General Positive', 'General Negative', 'Other'],
};

// FIX: Define the union type for the valid category keys
type CategoryKey = keyof typeof FEEDBACK_CATEGORIES_MAP;

const CATEGORY_OPTIONS = Object.keys(FEEDBACK_CATEGORIES_MAP) as CategoryKey[];


// --- Types ---
interface FeedbackDetails {
  feedbackType: string;
  feedbackCategory: string; 
  rating: number;
  feedbackText: string;
}

// Mock initial agent details
const MOCK_AGENT = {
  name: "AGENT 1",
  email: "agent@gmail.com",
};

const AgentFeedback: React.FC = () => {
  // Use CategoryKey for better type safety on the category field
  const [formData, setFormData] = useState<{
    category: CategoryKey | string; // Allow CategoryKey or ""
    subCategory: string;
    rating: number;
    feedbackText: string;
  }>({
    category: "",
    subCategory: "",
    rating: 0,
    feedbackText: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"success" | "error" | null>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Assert value as CategoryKey to resolve type issue
    const newCategory = e.target.value as CategoryKey; 
    
    // FIX: Index map using the asserted type
    // const firstSubCategory = FEEDBACK_CATEGORIES_MAP[newCategory]?.[0] || '';
    
    setFormData(prev => ({ 
      ...prev, 
      category: newCategory, 
      subCategory: "" 
    }));
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, subCategory: e.target.value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, feedbackText: e.target.value }));
  };

  const handleRatingChange = (newRating: number) => {
    setFormData(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus(null);
    
    // Validation Check uses explicit casting for safety/checking
    if (!formData.category) {
        alert("Please select a Feedback Category.");
        return;
    }
    const categoryKey = formData.category as CategoryKey;
    if (FEEDBACK_CATEGORIES_MAP[categoryKey] && !formData.subCategory) {
         alert("Please select a Feedback Subcategory.");
         return;
    }
    if (!formData.feedbackText) {
        alert("Please enter your feedback text.");
        return;
    }

    setIsSubmitting(true);

    const payload: FeedbackDetails = {
      feedbackCategory: formData.category, 
      feedbackText: `[Category: ${formData.category} | Subcategory: ${formData.subCategory || 'N/A'}] - ${formData.feedbackText}`,
      feedbackType: "Agent", 
      rating: formData.rating,
    };

    try {
      await axios.post(`${API_BASE_URL}/agent/addFeedbackFromAgent/${AGENT_ID}`, payload);
      
      setSubmissionStatus("success");
      setFormData({
        category: "",
        subCategory: "",
        rating: 0,
        feedbackText: "",
      });
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIX: Cast formData.category to CategoryKey before indexing
  const currentSubCategories = formData.category 
    ? FEEDBACK_CATEGORIES_MAP[formData.category as CategoryKey] || []
    : [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="w-7 h-7 text-orange-600" /> Submit Feedback
      </h2>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
        
        {submissionStatus === "success" && (
          <div className="p-4 mb-6 rounded-lg bg-green-100 text-green-800 border border-green-300">
            Thank you! Your feedback has been successfully submitted.
          </div>
        )}
        {submissionStatus === "error" && (
          <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800 border border-red-300">
            Submission failed. Please try again later.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Email - Readonly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={MOCK_AGENT.name}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={MOCK_AGENT.email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Category Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Select Feedback Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50"
              >
                {/* Placeholder option */}
                <option value="" disabled>---Select Category---</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Subcategory */}
            <div>
              <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Select Subcategory
              </label>
              <select
                id="subCategory"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleSubCategoryChange}
                required={currentSubCategories.length > 0 && !!formData.category}
                disabled={!formData.category || currentSubCategories.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 disabled:bg-gray-100 disabled:text-gray-500"
              >
                {/* Placeholder option (always present) */}
                <option value="" disabled>---Select Subcategory---</option>
                {currentSubCategories.map(subCat => (
                  <option key={subCat} value={subCat}>{subCat}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Rate Propadda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate PropAdda ({formData.rating} Stars)
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => handleRatingChange(star)}
                />
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-1">
              Type your feedback
            </label>
            <textarea
              id="feedbackText"
              name="feedbackText"
              rows={5}
              value={formData.feedbackText}
              onChange={handleTextChange}
              required
              placeholder="Tell us what you think..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 resize-none"
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
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentFeedback;