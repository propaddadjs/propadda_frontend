import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Home,
  Users,
  UserCheck,
  Bell,
  ClipboardCheck,
  FileCheck2,
  AlertCircle,
  MapPin,
  Bath,
  BedDouble,
  Maximize2,
} from "lucide-react";

/* ---------------- Types ---------------- */
type DashboardMetrics = {
  totalProperties?: number;
  totalSellers?: number;
  totalBuyers?: number;
  totalEnquiries?: number;
};

type MediaResponse = { filename?: string; ord?: number; url: string };
type OwnerResponse = {
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

type PropertyResponse = {
  listingId: number;
  category: string;
  title?: string;
  description?: string;
  preference?: string;
  propertyType?: string;
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  state?: string;
  locality?: string;
  address?: string;
  media?: MediaResponse[];
  mediaFiles?: MediaResponse[];
  residentialOwner?: OwnerResponse;
  commercialOwner?: OwnerResponse;
  [key: string]: any;
};

type PageResponse = {
  content?: PropertyResponse[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
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
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-0.5">
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

const ActionCard: React.FC<{
  title: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  accent?: string;
}> = ({ title, description, to, icon, accent = "from-orange-50 to-blue-50" }) => (
  <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:-translate-y-0.5">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="p-5 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-200">
          {icon}
        </div>
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        </div>
      </div>
      <Link
        to={to}
        className="px-4 py-2 rounded-lg border border-themeOrange text-themeOrange bg-white hover:bg-orange-50 text-sm"
      >
        Open
      </Link>
    </div>
  </div>
);

/* --------- Pending item card (mini) ---------- */
const PendingItem: React.FC<{ p: PropertyResponse }> = ({ p }) => {
  const media = p.mediaFiles ?? p.media ?? [];
  const thumb = (media.find((m) => m.ord === 1)?.url || media[0]?.url) ?? undefined;
  // const location = [p.locality, p.city].filter(Boolean).join(", ");
  const location = p.city;
  const price =
    typeof p.price === "number" ? `₹${Number(p.price).toLocaleString("en-IN")}` : "-";

  return (
    <div className="flex items-start gap-4 p-3 border rounded-xl hover:shadow-sm transition hover:-translate-y-0.5">
      <div className="w-24 h-20 rounded-xl bg-gray-100 border overflow-hidden flex-shrink-0">
        {thumb ? (
          <img className="w-full h-full object-cover" src={thumb} alt={p.title ?? "thumb"} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{p.title ?? p.propertyType ?? "Untitled"}</div>
        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {location}
            </span>
          )}
          {p.bedrooms !== undefined && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" /> {p.bedrooms} BHK
            </span>
          )}
          {p.bathrooms !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {p.bathrooms} Bath
            </span>
          )}
          {p.area !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" /> {p.area} sq.ft
            </span>
          )}
        </div>
        <div className="text-sm text-gray-700 mt-1">{price}</div>
      </div>

      <div className="flex flex-col gap-2">
        <Link
          to="/admin/listings/pending"
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs"
        >
          Review
        </Link>
      </div>
    </div>
  );
};

/* ---------------- Page ---------------- */
const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [errMetrics, setErrMetrics] = useState<string | null>(null);

  const [pending, setPending] = useState<PropertyResponse[] | null>(null);
  const [loadingPending, setLoadingPending] = useState(false);
  const [errPending, setErrPending] = useState<string | null>(null);
  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

  // ---- Fetch Metrics ----
  useEffect(() => {
    const run = async () => {
      setLoadingMetrics(true);
      setErrMetrics(null);
      try {
        const resp = await axios.get<DashboardMetrics>(`${API_BASE_URL}/admin/dashboardMetrics`);
        setMetrics(resp.data ?? {});
      } catch (e) {
        console.error(e);
        setErrMetrics("Failed to load dashboard metrics.");
      } finally {
        setLoadingMetrics(false);
      }
    };
    run();
  }, []);

  // ---- Fetch Pending Properties ----
  useEffect(() => {
    const fetchPending = async () => {
      setLoadingPending(true);
      setErrPending(null);
      try {
        // Ask for a generous page size so we can sort locally and pick top 4
        const resp = await axios.get<PageResponse | PropertyResponse[] | any>(
          `${API_BASE_URL}/admin/pendingProperties`,
          { params: { page: 0, size: 50 } }
        );
        const body = resp.data;

        let items: PropertyResponse[] = [];
        if (Array.isArray(body?.content)) {
          items = body.content as PropertyResponse[];
        } else if (Array.isArray(body?.commercial) || Array.isArray(body?.residential)) {
          const com: PropertyResponse[] = Array.isArray(body.commercial) ? body.commercial : [];
          const res: PropertyResponse[] = Array.isArray(body.residential) ? body.residential : [];
          items = [...com, ...res];
        } else if (Array.isArray(body)) {
          items = body as PropertyResponse[];
        } else {
          items = [];
        }

        // Sort by listingId desc and keep top 4
        const top = [...items]
          .filter((x) => typeof x.listingId === "number")
          .sort((a, b) => (b.listingId ?? 0) - (a.listingId ?? 0))
          .slice(0, 4);

        setPending(top);
      } catch (e) {
        console.error(e);
        setErrPending("Failed to load pending properties.");
        setPending([]);
      } finally {
        setLoadingPending(false);
      }
    };
    fetchPending();
  }, []);

  const { totalProperties, totalSellers, totalBuyers, totalEnquiries } = metrics;

  const statCards = useMemo(
    () => [
      {
        title: "Total Properties",
        value: totalProperties,
        icon: <Home className="w-5 h-5 text-themeOrange" />,
        accent: "from-red-600 to-amber-300",
      },
      {
        title: "Total Sellers",
        value: totalSellers,
        icon: <UserCheck className="w-5 h-5 text-themeOrange" />,
        accent: "from-blue-500 to-indigo-300",
      },
      {
        title: "Total Buyers",
        value: totalBuyers,
        icon: <Users className="w-5 h-5 text-themeOrange" />,
        accent: "from-emerald-500 to-teal-300",
      },
      {
        title: "Total Enquiries",
        value: totalEnquiries,
        icon: <ClipboardCheck className="w-5 h-5 text-themeOrange" />,
        accent: "from-rose-500 to-pink-300",
      },
    ],
    [totalProperties, totalSellers, totalBuyers, totalEnquiries]
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {statCards.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            loading={loadingMetrics}
            accent={s.accent}
          />
        ))}
      </div>

      {/* Errors for metrics */}
      {errMetrics && (
        <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errMetrics}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ActionCard
          title="View Listings to Approve"
          description="Review and act on pending listing approvals."
          to="/admin/listings/pending"
          icon={<FileCheck2 className="w-5 h-5 text-themeOrange" />}
          accent="from-sky-500 to-amber-500"
        />
        <ActionCard
          title="View KYC Requests"
          description="Approve or reject seller KYC submissions."
          to="/admin/users/kyc"
          icon={<UserCheck className="w-5 h-5 text-themeOrange" />}
          accent="from-blue-500 to-red-500"
        />
        <ActionCard
          title="View Notifications"
          description="See recent events, alerts and system messages."
          to="/admin/notifications"
          icon={<Bell className="w-5 h-5 text-themeOrange" />}
          accent="from-emerald-500 to-yellow-800"
        />
      </div>

      {/* Pending Listings (live) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Pending Listings Approval</h3>
          <Link to="/admin/listings/pending" className="text-themeOrange text-sm hover:underline">
            View all
          </Link>
        </div>

        {loadingPending ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-3 border rounded-xl">
                <Shimmer className="w-24 h-20" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-4 w-2/3" />
                  <Shimmer className="h-3 w-1/2" />
                  <Shimmer className="h-3 w-1/3" />
                </div>
                <Shimmer className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : errPending ? (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errPending}
          </div>
        ) : (pending?.length ?? 0) === 0 ? (
          <div className="text-gray-600">No pending properties.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
            {pending!.map((p) => (
              <PendingItem key={p.listingId} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
