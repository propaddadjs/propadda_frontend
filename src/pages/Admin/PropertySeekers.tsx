import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Phone, Mail, MapPin } from "lucide-react";

type UserResponse = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state?: string;
  city?: string;
  role: string;
  profileImageUrl?: string;
};

// --- tiny helpers ---
const cx = (...cls: (string | false | undefined | null)[]) =>
  cls.filter(Boolean).join(" ");

const initials = (first?: string, last?: string) =>
  ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();

const btn = (...cls: (string | false | undefined | null)[]) =>
  "inline-flex items-center justify-center gap-2 rounded-lg border text-sm transition " +
  (cls.filter(Boolean).join(" ") || "");

// role -> badge styling
const roleBadge = (role?: string) => {
  const r = (role || "").toLowerCase();
  if (r === "agent")
    return "bg-yellow-100 text-themeOrange border border-yellow-300";
  if (r === "buyer")
    return "bg-green-100 text-green-700 border border-green-200";
  if (r === "admin")
    return "bg-blue-100 text-blue-700 border border-blue-200";
  return "bg-gray-50 text-gray-600 border border-gray-200";
};

const prettyRole = (role?: string) => {
  const r = (role || "").toLowerCase();
  if (r === "agent") return "PropAdda Agent";
  if (r === "buyer") return "PropAdda Buyer";
  if (r === "admin") return "PropAdda Admin";
  return "PropAdda User";
};

// --- a single user card ---
const UserCard: React.FC<{ u: UserResponse }> = ({ u }) => {
  const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Unnamed";
  const phoneHref = u.phoneNumber ? `tel:+91${u.phoneNumber}` : undefined;
  const mailHref = u.email ? `mailto:${u.email}` : undefined;
  const location = [u.city, u.state].filter(Boolean).join(", ");

  return (
    <div
      className="
        relative overflow-hidden rounded-2xl
        bg-white/80 backdrop-blur
        border border-gray-100 shadow-sm
        hover:shadow-lg hover:-translate-y-0.5 transition-all
      "
    >
      {/* subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-themeOrange/80 via-orange-400 to-blue-300" />

      <div className="p-5">
        <div className="flex items-stretch gap-5">
          {/* Avatar — increased size */}
          <div className="shrink-0">
            {u.profileImageUrl ? (
              <img
                src={u.profileImageUrl}
                alt={name}
                className="w-40 h-40 rounded-xl object-cover border border-orange-200 shadow-sm"
              />
            ) : (
              <div className="w-40 h-40 rounded-xl bg-orange-50 text-7xl text-orange-500 flex items-center justify-center font-semibold border border-orange-200 shadow-sm">
                {initials(u.firstName, u.lastName) || "U"}
              </div>
            )}
          </div>

          {/* Middle info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">{name}</h3>
                <div className={cx("mt-1 inline-flex text-xs px-2 py-1 rounded-full", roleBadge(u.role))}>
                  {prettyRole(u.role)}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 flex-none" />
                <span className="truncate">
                  {u.phoneNumber ? `+91 ${u.phoneNumber}` : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 flex-none" />
                <span className="truncate">{u.email || "-"}</span>
              </div>

              {location && (
                <div className="pt-2 text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right actions (no View button, no ID) */}
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
            {/* intentionally empty to keep spacing balanced */}
            {/* <div />
          </div>  */}
        </div>
      </div>

      {/* soft bottom glow */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 h-20 bg-gradient-to-t from-orange-100/40 to-transparent" />
    </div>
  );
};

const PropertySeekers: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // pagination (8 per page, 2 columns)
  const [page, setPage] = useState(1); // 1-based
  const pageSize = 8;

   const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";


  // sort by userId desc in-memory (background) before paginating
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => b.userId - a.userId),
    [users]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedUsers.length / pageSize)),
    [sortedUsers.length]
  );

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, page]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const resp = await axios.get<UserResponse[]>(`${API_BASE_URL}/admin/allUsers`);
        setUsers(resp.data || []);
        setPage(1);
      } catch (e: any) {
        console.error(e);
        setErr("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // number row window (like 1..10)
  const windowStart = Math.floor((page - 1) / 10) * 10 + 1;
  const windowEnd = Math.min(windowStart + 9, totalPages);
  const numbers = Array.from({ length: windowEnd - windowStart + 1 }, (_, i) => windowStart + i);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-100 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Property Seekers</h2>
          </div>
          {/* Same as listings: show result count (current page) */}
          <div className="text-sm text-gray-600 bg-white/70 backdrop-blur px-3 py-1.5 rounded-full border border-gray-200">
            {loading ? "Loading..." : `${pageSlice.length} results`}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur p-5 shadow-sm animate-pulse"
            >
              <div className="flex items-start gap-5">
                <div className="w-40 h-40 rounded-xl bg-gray-100 border" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : sortedUsers.length === 0 ? (
        <div className="text-gray-600">No users found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pageSlice.map((u) => (
              <UserCard key={u.userId} u={u} />
            ))}
          </div>

          {/* Unified Pagination (same template as listings) */}
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

export default PropertySeekers;
