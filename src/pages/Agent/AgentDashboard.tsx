import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Home,
  DollarSign,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Bell,
  Clock,
  User,
  ExternalLink,
  TimerOff,
  RefreshCw,
} from "lucide-react";

/* ---------------- Config ---------------- */
 const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const AGENT_ID = 2;

/* ---------------- Types ---------------- */
type AgentMetrics = {
  totalPropertiesListed: number;
  activeProperties: number;
  totalPropertiesPendingApproval: number;
  totalPropertiesSold: number;
};

type AgentDetails = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  city: string;
  role: string;
  profileImageUrl?: string;
  propaddaVerified: boolean;
  kycVerified: "PENDING" | "VERIFIED" | "REJECTED";
};

type MediaResponse = { filename?: string; ord?: number; url: string };
type PropertyResponse = {
  listingId: number;
  category: "Residential" | "Commercial";
  preference?: string;
  propertyType?: string;
  title?: string;
  city?: string;
  locality?: string;
  price?: number;
  area?: number;
  vip?: boolean;
  media?: MediaResponse[];
  mediaFiles?: MediaResponse[];
  expired?: boolean;
};
type AgentAllPropertiesResponse = {
  Commercial: PropertyResponse[];
  Residential: PropertyResponse[];
};

/* ---------------- UI helpers ---------------- */
const formatNum = (n?: number) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : "—";

const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className || ""}`} />
);

const StatCard: React.FC<{
  title: string;
  value?: number;
  icon: React.ReactNode;
  loading?: boolean;
  accent?: string;
}> = ({ title, value, icon, loading, accent = "from-orange-50 to-amber-50" }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:translate-y-0.5 transition duration-150">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="p-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-200">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-500 truncate">{title}</div>
          {loading ? (
            <Shimmer className="h-6 w-20 mt-2" />
          ) : (
            <div className="text-2xl font-semibold mt-1">{formatNum(value)}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuickActionButton: React.FC<{
  to: string;
  label: string;
  icon: React.ReactNode;
  accent?: string;
}> = ({ to, label, icon, accent = "from-orange-50 to-blue-50" }) => (
  <Link
    to={to}
    className="relative overflow-hidden flex flex-col items-center justify-center p-4 text-sm font-medium rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-700 hover:text-white hover:bg-themeOrange transition duration-200 text-center hover:-translate-y-0.5"
  >
    <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${accent} opacity-0 hover:opacity-100 transition`} />
    <div className="p-3 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-orange-100 transition">
      {icon}
    </div>
    <span className="mt-3 text-sm font-semibold">{label}</span>
  </Link>
);

/* Renewal item used in dashboard preview */
const RenewalItem: React.FC<{ p: PropertyResponse }> = ({ p }) => {
  const title = p.title || p.propertyType || "Untitled";
  const location = [p.locality, p.city].filter(Boolean).join(", ");

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-md transition duration-150">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate" title={title}>
          {title}
        </p>
        <p className="text-xs text-gray-500 truncate flex items-center gap-1" title={location}>
          <MapPin className="w-3 h-3 text-gray-400" /> {location || "—"}
        </p>
      </div>
      <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-red-600 text-white">
          <TimerOff className="w-3 h-3" /> Expired
        </span>
        <Link
          to="/agent/listings/expired"
          className="flex items-center text-themeOrange hover:text-orange-700 transition duration-150 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Renew
        </Link>
      </div>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
const AgentDashboard: React.FC = () => {
  const [details, setDetails] = useState<AgentDetails | null>(null);
  const [metrics, setMetrics] = useState<AgentMetrics>({} as AgentMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expiredPreview, setExpiredPreview] = useState<PropertyResponse[]>([]);
  const [loadingExpired, setLoadingExpired] = useState<boolean>(true);
  const [errorExpired, setErrorExpired] = useState<string | null>(null);

  /* Fetch profile + metrics */
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detailsResp, metricsResp] = await Promise.all([
          axios.get<AgentDetails>(`${API_BASE_URL}/agent/getAgentDetails/${AGENT_ID}`),
          axios.get<AgentMetrics>(`${API_BASE_URL}/agent/getAgentDashboardMetrics/${AGENT_ID}`),
        ]);
        setDetails(detailsResp.data);
        setMetrics(metricsResp.data ?? ({} as AgentMetrics));
      } catch (e) {
        console.error("Failed to load agent dashboard data:", e);
        setError("Failed to load dashboard data. Check API endpoints.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  /* Fetch expired listings (preview top 3) */
  useEffect(() => {
    let mounted = true;
    const loadExpired = async () => {
      setLoadingExpired(true);
      setErrorExpired(null);
      try {
        const resp = await axios.get<AgentAllPropertiesResponse>(
          `${API_BASE_URL}/agent/expiredPropertiesByAgent/${AGENT_ID}`
        );
        const data = resp.data;
        const commercial = Array.isArray(data?.Commercial) ? data.Commercial : [];
        const residential = Array.isArray(data?.Residential) ? data.Residential : [];
        const merged = [...commercial, ...residential];

        merged.sort((a, b) => (b.listingId ?? 0) - (a.listingId ?? 0));
        if (mounted) setExpiredPreview(merged.slice(0, 3));
      } catch (e) {
        console.error("Failed to load expired previews:", e);
        if (mounted) setErrorExpired("Could not load expired listings right now.");
      } finally {
        if (mounted) setLoadingExpired(false);
      }
    };
    loadExpired();
    return () => {
      mounted = false;
    };
  }, []);

  const {
    totalPropertiesListed,
    activeProperties,
    totalPropertiesPendingApproval,
    totalPropertiesSold,
  } = metrics;

  const statCards = useMemo(
    () => [
      {
        title: "Total Properties Sold",
        value: totalPropertiesSold,
        icon: <DollarSign className="w-5 h-5 text-green-600" />,
        accent: "from-green-500 to-emerald-300",
      },
      {
        title: "Total Properties Posted",
        value: totalPropertiesListed,
        icon: <Home className="w-5 h-5 text-blue-600" />,
        accent: "from-blue-500 to-sky-300",
      },
      {
        title: "Active Listings",
        value: activeProperties,
        icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
        accent: "from-orange-500 to-amber-300",
      },
      {
        title: "Pending Approval",
        value: totalPropertiesPendingApproval,
        icon: <Clock className="w-5 h-5 text-red-600" />,
        accent: "from-red-500 to-pink-300",
      },
    ],
    [totalPropertiesListed, totalPropertiesPendingApproval, totalPropertiesSold, activeProperties]
  );

  const themeOrange = "text-orange-500";
  const themeOrangeHover = "hover:text-orange-600";

  /* Loading & Error skeletons */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-20" />
          ))}
        </div>
        <Shimmer className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="p-4 rounded-lg border border-red-300 bg-red-100 text-red-800">
          Error: {error}
        </div>
      </div>
    );
  }

  /* Render */
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            loading={loading}
            accent={s.accent}
          />
        ))}
      </div>

      {/* Profile + Actions + Expired Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="lg:col-span-1 bg-white shadow-xl rounded-2xl p-6 border-t-4 border-orange-500">
          <div className="flex flex-col items-center">
            <img
              src={details?.profileImageUrl || "https://placehold.co/100x100/eeeeee/333333?text=Agent"}
              alt="Agent Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-inner"
            />
            <h2 className="text-xl font-bold mt-4 text-gray-900">
              {details?.firstName} {details?.lastName}
            </h2>
            <p className="text-sm text-gray-500">{details?.email}</p>

            {details?.propaddaVerified && (
              <span className="mt-3 inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                <CheckCircle className="w-4 h-4 mr-1" /> VERIFIED SELLER
              </span>
            )}

            <div className="mt-6 w-full space-y-2 text-sm">
              <div className="flex items-center text-gray-700">
                <Mail className={`w-4 h-4 mr-3 ${themeOrange}`} /> {details?.email}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className={`w-4 h-4 mr-3 ${themeOrange}`} /> {details?.phoneNumber}
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className={`w-4 h-4 mr-3 ${themeOrange}`} /> {details?.city}, {details?.state}
              </div>
            </div>
          </div>
        </div>

        {/* Actions + Expired Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton
              to="/agent/postproperty"
              label="Add New Property"
              icon={<Home className="w-5 h-5 text-orange-500 group-hover:text-white transition" />}
            />
            <QuickActionButton
              to="/agent/notifications"
              label="View Notifications"
              icon={<Bell className="w-5 h-5 text-blue-500 group-hover:text-white transition" />}
            />
            <QuickActionButton
              to="/agent/listings/pending"
              label="Pending Listings"
              icon={<Clock className="w-5 h-5 text-red-500 group-hover:text-white transition" />}
            />
            <QuickActionButton
              to="/agent/support/manageProfile"
              label="Manage Profile"
              icon={<User className="w-5 h-5 text-green-500 group-hover:text-white transition" />}
            />
          </div>

          {/* Listing Expiry Renewal (dynamic) */}
          <div className="bg-white shadow-md rounded-2xl border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Listing Expiry Renewal</h3>
              <Link
                to="/agent/listings/expired"
                className={`text-sm font-medium ${themeOrange} ${themeOrangeHover} flex items-center`}
              >
                View Expired <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {loadingExpired ? (
                <>
                  <div className="h-12 bg-gray-50 border border-gray-100 rounded-md animate-pulse" />
                  <div className="h-12 bg-gray-50 border border-gray-100 rounded-md animate-pulse" />
                  <div className="h-12 bg-gray-50 border border-gray-100 rounded-md animate-pulse" />
                </>
              ) : errorExpired ? (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-md">
                  {errorExpired}
                </div>
              ) : expiredPreview.length === 0 ? (
                <p className="text-gray-500">No listings currently expired.</p>
              ) : (
                expiredPreview.map((p) => (
                  <RenewalItem key={`${p.category}-${p.listingId}`} p={p} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
