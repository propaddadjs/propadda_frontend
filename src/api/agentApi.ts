// import { httpGet, httpPatch, httpPost, httpPut } from "./http";

// export const AgentApi = {
// getAllPropertiesByAgent: (agentId: number) =>
// httpGet<ListingSummary[]>(`/agent/allPropertiesByAgent/${agentId}`),
// pendingApprovalPropertiesForAgent: (agentId: number) =>
// httpGet<ListingSummary[]>(`/agent/pendingApprovalPropertiesForAgent/${agentId}`),
// getExpiredProperties: (agentId: number) =>
// httpGet<ListingSummary[]>(`/agent/expiredPropertiesByAgent/${agentId}`),
// getAgentDetails: (agentId: number) =>
// httpGet<AgentProfileDTO>(`/agent/getAgentDetails/${agentId}`),
// updateAgentDetails: (agentId: number, payload: Partial<AgentProfileDTO>) =>
// httpPut<AgentProfileDTO>(`/agent/updateAgentDetails/${agentId}`, payload),
// getAgentDashboardMetrics: (agentId: number) =>
// httpGet<AgentDashboardMetricsDTO>(`/agent/getAgentDashboardMetrics/${agentId}`),
// updateAgentPassword: (agentId: number, payload: PasswordUpdateRequest) =>
// httpPut<void>(`/agent/updateAgentPassword/${agentId}`, payload),
// addFeedbackFromAgent: (agentId: number, payload: FeedbackDetails) =>
// httpPost<void>(`/agent/addFeedbackFromAgent/${agentId}`, payload),
// addHelpRequestFromAgent: (agentId: number, payload: HelpDetails) =>
// httpPost<void>(`/agent/addHelpRequestFromAgent/${agentId}`, payload),
// allNotificationsForAgent: (agentId: number) =>
// httpGet<NotificationDTO[]>(`/agent/allNotificationsForAgent/${agentId}`),
// newNotificationsForAgent: (agentId: number) =>
// httpGet<NotificationDTO[]>(`/agent/newNotificationsForAgent/${agentId}`),
// getUnreadNotificationCountForAgent: (agentId: number) =>
// httpGet<number>(`/agent/getUnreadNotificationCountForAgent/${agentId}`),
// markNotificationViewedForAgent: (agentId: number, notificationId: number) =>
// httpPatch<void>(`/agent/markNotificationViewedForAgent/${agentId}/${notificationId}`),
// markAllNotificationViewedForAgent: (agentId: number) =>
// httpPatch<void>(`/agent/markAllNotificationViewedForAgent/${agentId}`),
// };