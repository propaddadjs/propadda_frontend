import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

/* -------- Types -------- */
type SellerResponse = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state?: string;
  city?: string;
  role: string;
  profileImageUrl?: string;
  agentReraNumber?: string;
  propaddaVerified?: boolean;
  aadharUrl?: string;
  kycVerified?: string; // "APPROVED" | "PENDING" | "REJECTED"
};

/* -------- Helpers -------- */
const cx = (...cls: (string | false | undefined | null)[]) =>
  cls.filter(Boolean).join(" ");

const initials = (f?: string, l?: string) =>
  ((f?.[0] || "") + (l?.[0] || "")).toUpperCase();

const btn = (...cls: (string | false | undefined | null)[]) =>
  "inline-flex items-center justify-center gap-2 rounded-lg border text-sm transition " +
  (cls.filter(Boolean).join(" ") || "");

const badge = (extra: string) =>
  cx(
    "inline-flex items-center text-xs font-medium px-2 py-1 rounded-full border",
    extra
  );

/* -------- Card -------- */
const SellerCard: React.FC<{
  s: SellerResponse;
  onToggleVerify: (id: number) => void;
}> = ({ s, onToggleVerify }) => {
  const name = `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Unnamed";
  // const phoneHref = s.phoneNumber ? `tel:+91${s.phoneNumber}` : undefined;
  // const mailHref = s.email ? `mailto:${s.email}` : undefined;
  const location = [s.city, s.state].filter(Boolean).join(", ");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-themeOrange/80 via-orange-400 to-blue-300" />

      <div className="p-5">
        <div className="flex items-stretch gap-5">
          {/* Avatar + Mark Verified (under image) */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            {s.profileImageUrl ? (
              <img
                src={s.profileImageUrl}
                alt={name}
                className="w-40 h-40 rounded-xl object-cover border border-orange-200 shadow-sm"
              />
            ) : (
              <div className="w-40 h-40 rounded-xl bg-orange-50 text-7xl text-orange-500 flex items-center justify-center font-semibold border border-orange-200 shadow-sm">
                {initials(s.firstName, s.lastName) || "U"}
              </div>
            )}

            <button
              onClick={() => onToggleVerify(s.userId)}
              className={btn(
                "px-3 py-2 border-indigo-500 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-full",
                s.propaddaVerified && "opacity-70 cursor-not-allowed"
              )}
              disabled={s.propaddaVerified}
              title={
                s.propaddaVerified
                  ? "Already PropAdda Verified"
                  : "Mark PropAdda Verified"
              }
            >
              <ShieldCheck className="w-4 h-4" />
              {s.propaddaVerified ? "Verified" : "Mark Verified"}
            </button>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">{name}</h3>
                <div className="mt-1 inline-flex text-xs px-2 py-1 rounded-full bg-yellow-100 text-themeOrange border border-yellow-300">
                  PropAdda Seller
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {s.kycVerified === "APPROVED" && (
                    <span
                      className={badge(
                        "bg-green-100 text-green-700 border-green-300"
                      )}
                    >
                      KYC Verified
                    </span>
                  )}
                  {s.propaddaVerified && (
                    <span
                      className={badge(
                        "bg-indigo-100 text-indigo-700 border-indigo-300"
                      )}
                    >
                      PropAdda Verified
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{s.phoneNumber ? `+91 ${s.phoneNumber}` : "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span>{s.email || "-"}</span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{location}</span>
                    </div>
                  )}
                  {s.agentReraNumber && (
                    <div className="text-xs text-gray-500">
                      RERA: {s.agentReraNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Right-side Call / Email buttons — same size as PropertySeekers */}
              {/* <div className="flex flex-col items-end justify-between min-w-[9.5rem]">
                <div className="flex flex-col gap-2">
                  <a
                    href={phoneHref}
                    onClick={(e) => !phoneHref && e.preventDefault()}
                    className={btn(
                      "px-3 py-2 border-gray-200 bg-white hover:bg-yellow-50",
                      !phoneHref && "opacity-50 cursor-not-allowed"
                    )}
                    aria-disabled={!phoneHref}
                    title={phoneHref ? `Call ${name}` : "Phone not available"}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>

                  <a
                    href={mailHref}
                    onClick={(e) => !mailHref && e.preventDefault()}
                    className={btn(
                      "px-3 py-2 border-gray-200 bg-white hover:bg-yellow-50",
                      !mailHref && "opacity-50 cursor-not-allowed"
                    )}
                    aria-disabled={!mailHref}
                    title={mailHref ? `Email ${name}` : "Email not available"}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
                <div />
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------- Page -------- */
const AgentBroker: React.FC = () => {
  const [sellers, setSellers] = useState<SellerResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://propadda-backend-506455747754.asia-south2.run.app";

  // sort by userId desc before paginating
  const sorted = useMemo(
    () => [...sellers].sort((a, b) => b.userId - a.userId),
    [sellers]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  // numbered pagination window like 1..10
  const windowStart = Math.floor((page - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalPages);
  const numbers = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  );

  const fetchSellers = async () => {
    setLoading(true);
    setErr(null);
    try {
      const resp = await axios.get<SellerResponse[]>(
        `${API_BASE_URL}/admin/allSellers`
      );
      setSellers(resp.data || []);
      setPage(1);
    } catch (e) {
      console.error(e);
      setErr("Failed to load sellers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const toggleVerify = async (id: number) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/admin/togglePropaddaVerified/${id}`
      );
      fetchSellers();
    } catch (e) {
      console.error(e);
      alert("Failed to toggle PropAdda Verified");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with result count (current page) */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-gray-800">
            Agents / Brokers / Builders
          </h2>
          <div className="text-sm text-gray-600 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">
            {loading ? "Loading..." : `${pageSlice.length} results`}
          </div>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : sorted.length === 0 ? (
        <div className="text-gray-600">No sellers found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageSlice.map((s) => (
              <SellerCard key={s.userId} s={s} onToggleVerify={toggleVerify} />
            ))}
          </div>

          {/* Unified pagination (same as PropertySeekers) */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf6f3] px-4 py-3 border border-orange-100">
            <div className="text-sm text-gray-600">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={cx(
                  "text-sm text-gray-700",
                  page === 1 && "opacity-50 cursor-not-allowed"
                )}
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹ Previous Page
              </button>

              <div className="flex items-center">
                {numbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cx(
                      "mx-1 w-9 h-9 text-sm rounded-full border transition",
                      n === page
                        ? "bg-buttonOrange text-themeOrange border-themeOrange"
                        : "bg-white hover:bg-gray-50"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                className={cx(
                  "text-sm text-gray-700",
                  page === totalPages && "opacity-50 cursor-not-allowed"
                )}
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next Page ›
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentBroker;
