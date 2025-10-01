export type PropertyStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED';
export type PropertyCategory = 'villa' | 'apartment' | 'plot' | 'pg' | string;

export interface ListingSummary {
id: number;
title: string;
price: number;
city?: string;
locality?: string;
category: PropertyCategory;
status: PropertyStatus;
coverImageUrl?: string;
createdAt?: string; // ISO
updatedAt?: string; // ISO
}

export interface ListingDetail extends ListingSummary {
description?: string;
images?: string[];
features?: Record<string, string | number | boolean>;
carpetArea?: number;
builtUpArea?: number;
bedrooms?: number;
bathrooms?: number;
}

export interface AgentProfileDTO {
id: number;
name: string;
email: string;
phone?: string;
avatarUrl?: string;
agencyName?: string;
kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
addressLine1?: string;
addressLine2?: string;
city?: string;
state?: string;
pincode?: string;
}


export interface AgentDashboardMetricsDTO {
totalListings: number;
activeListings: number;
pendingListings: number;
expiredListings: number;
viewsThisMonth?: number;
leadsThisMonth?: number;
}


export interface PasswordUpdateRequest {
currentPassword: string;
newPassword: string;
}


export interface FeedbackDetails {
subject: string;
message: string;
rating?: number; // 1..5
}


export interface HelpDetails {
topic: string;
description: string;
urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
}


export interface NotificationDTO {
id: number;
title: string;
body: string;
isRead: boolean;
createdAt: string; // ISO
}