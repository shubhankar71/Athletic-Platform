import { useState, useMemo, useEffect } from "react";
import { MapPin, Users, Search, Target, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { getOpportunitiesApi, applyToOpportunityApi, getAthleteApplicationsApi } from "../../api/coachApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./OpportunityFeed.css";

const TYPE_TONE = {
  recruitment: "teal",
  trial: "coral",
  tournament: "amber",
  camp: "teal",
  workshop: "amber",
};

const BATTING_ROLE_OPTIONS = [
  "All Roles",
  "Opening Batter",
  "Middle-Order Batter",
  "Wicketkeeper-Batter",
  "Finisher",
  "Top-Order Batter",
  "Lower-Order Batter",
  "All-Rounder",
];

function formatDate(iso) {
  if (!iso) return "Recent";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function OpportunityFeed() {
  const { isAuthenticated, user } = useAuth();
  const [allPosts, setAllPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const [appliedMap, setAppliedMap] = useState({});
  const [applyingId, setApplyingId] = useState(null);
  const [appError, setAppError] = useState(null);

  // Fetch ALL active coach opportunities from MongoDB backend
  const fetchAllOpportunities = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Pass empty params so backend returns ALL active coach opportunities
      const opps = await getOpportunitiesApi({});
      setAllPosts(opps || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching opportunity feed:", err);
      setApiError("Unable to load opportunities. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOpportunities();
  }, []);

  // Fetch athlete's existing applications to mark applied states
  useEffect(() => {
    if (isAuthenticated && user?.role === "athlete") {
      getAthleteApplicationsApi()
        .then((apps) => {
          if (Array.isArray(apps)) {
            const map = {};
            apps.forEach((a) => {
              if (a.opportunityId) map[a.opportunityId] = true;
            });
            setAppliedMap(map);
          }
        })
        .catch(() => null);
    }
  }, [isAuthenticated, user]);

  // STEP 3, 4, 5: Client-side filtering pipeline (Search -> Role -> Gender)
  const filteredPosts = useMemo(() => {
    if (!allPosts || !Array.isArray(allPosts)) return [];

    return allPosts.filter((post) => {
      // Exclude deleted
      if (post.status === "deleted") return false;

      // Search filter
      const q = query.trim().toLowerCase();
      const bRole = post.battingRole || "Opening Batter";
      const bType = post.type || "recruitment";
      const bLoc = post.location || "";
      const bSum = post.summary || "";
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        bRole.toLowerCase().includes(q) ||
        bType.toLowerCase().includes(q) ||
        bLoc.toLowerCase().includes(q) ||
        bSum.toLowerCase().includes(q);

      // Role filter
      const matchesRole =
        roleFilter === "All Roles" ||
        roleFilter === "all" ||
        bRole.toLowerCase().includes(roleFilter.toLowerCase().trim());

      return matchesSearch && matchesRole;
    });
  }, [allPosts, query, roleFilter]);

  const handleApply = async (id) => {
    setAppError(null);
    if (!isAuthenticated) {
      alert("Please sign in as an Athlete to apply to cricket opportunities.");
      return;
    }

    setApplyingId(id);
    try {
      await applyToOpportunityApi(id);
      setApplyingId(null);
      setAppliedMap((prev) => ({ ...prev, [id]: true }));
      // Refetch feed to update applicants count
      fetchAllOpportunities();
    } catch (err) {
      setApplyingId(null);
      if (err.message && err.message.toLowerCase().includes("already applied")) {
        setAppliedMap((prev) => ({ ...prev, [id]: true }));
      } else {
        setAppError({ id, message: err.message || "Failed to submit application." });
      }
    }
  };

  return (
    <div className="opp-feed" style={{ maxWidth: "860px" }}>
      {/* Toolbar: Search + Role Filter + Gender Filter */}
      <Card padded={false} style={{ padding: "16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px", background: "var(--bg-3)", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <Search size={16} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search batting opportunities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", background: "transparent", color: "var(--text-primary)", width: "100%", outline: "none", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label htmlFor="role-filter-select" style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
              Role:
            </label>
            <select
              id="role-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-3)", color: "var(--text-primary)", fontSize: "13px" }}
            >
              {BATTING_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <LoadingBlock label="Loading opportunities..." />
        </Card>
      ) : apiError ? (
        /* API Error State (Requirement 26) */
        <Card>
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--signal-red)" }}>
            <AlertCircle size={36} style={{ marginBottom: "12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
              Unable to load opportunities. Please try again.
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              {apiError}
            </p>
            <Button variant="secondary" size="sm" onClick={fetchAllOpportunities}>
              <RefreshCw size={14} /> Retry Loading
            </Button>
          </div>
        </Card>
      ) : filteredPosts.length === 0 ? (
        /* Empty Dataset / Filter Match State */
        <Card>
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-tertiary)" }}>
            <Target size={36} style={{ marginBottom: "12px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
              No opportunities found.
            </h3>
            <p style={{ fontSize: "13px" }}>
              No active opportunities match your active search keyword or filters.
            </p>
          </div>
        </Card>
      ) : (
        /* Active Coach Opportunities List */
        filteredPosts.map((post) => {
          const postId = post._id || post.id;
          const bRole = post.battingRole || "Opening Batter";
          const bStyle = post.battingStyle || "Right-Handed";
          const age = post.ageGroup || "U19";
          const isApplied = appliedMap[postId];
          const isBusy = applyingId === postId;
          const feeDisplay = post.formattedFee || (post.fee === 0 ? "Free" : `₹${(post.fee || 2000).toLocaleString('en-IN')}`);

          return (
            <Card key={postId} className="opp-feed__card">
              <div className="opp-feed__header">
                <div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                    <Badge tone={TYPE_TONE[post.type] || "teal"}>
                      {String(post.type).toUpperCase()}
                    </Badge>
                    <Badge variant="neutral">
                      ROLE: {bRole}
                    </Badge>
                    {/* FEE BADGE VISIBLE TO ATHLETES ONLY */}
                    <Badge tone="teal" style={{ fontWeight: 700 }}>
                      FEE: {feeDisplay}
                    </Badge>
                  </div>
                  <h3 className="opp-feed__title" style={{ marginTop: "6px" }}>{post.title}</h3>
                  <p className="opp-feed__org">
                    {post.creatorTeam || post.org || "Delhi Cricket Academy"} · posted by {post.creatorName || post.postedBy || "Coach"}
                  </p>
                </div>
                <p className="opp-feed__date">{formatDate(post.postedAt || post.createdAt)}</p>
              </div>

              <p className="opp-feed__summary">{post.summary}</p>

              <div style={{ display: "flex", gap: "12px", margin: "12px 0 4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                <span><strong>Batting Style:</strong> {bStyle}</span>
                <span>•</span>
                <span><strong>Age Group:</strong> {age}</span>
              </div>

              {appError && appError.id === postId && (
                <div style={{ color: "var(--signal-red)", fontSize: "12px", marginTop: "8px", background: "var(--signal-red-wash)", padding: "6px 10px", borderRadius: "4px" }}>
                  <AlertCircle size={13} inline /> {appError.message}
                </div>
              )}

              <div className="opp-feed__footer">
                <div className="opp-feed__meta">
                  <span>
                    <MapPin size={13} /> {post.location}
                  </span>
                  <span>
                    <Users size={13} /> {post.applicants || 0} applicants
                  </span>
                </div>

                {isApplied ? (
                  <Button variant="ghost" size="sm" disabled style={{ color: "var(--accent-teal)", fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> ALREADY APPLIED
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handleApply(postId)} disabled={isBusy}>
                    {isBusy ? "Applying…" : "APPLY NOW"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
