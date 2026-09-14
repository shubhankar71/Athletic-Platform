import { useState } from "react";
import { MapPin, Users, Search, Target, Shield } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getOpportunityPosts } from "../../api/mockApi.js";
import OpportunityComposer from "./OpportunityComposer.jsx";
import "../athlete/OpportunityFeed.css";

const TYPE_TONE = {
  recruitment: "teal",
  trial: "coral",
  tournament: "amber",
  camp: "teal",
  workshop: "amber",
};

const ROLE_FILTERS = [
  "All",
  "Opening Batter",
  "Middle-Order Batter",
  "Wicketkeeper-Batter",
  "Finisher",
];

function formatDate(iso) {
  if (!iso) return "Recent";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function CoachOpportunities() {
  const [roleFilter, setRoleFilter] = useState("All");
  const [query, setQuery] = useState("");

  const { data: posts, isLoading, refetch } = useAsyncData(
    () => getOpportunityPosts(query, roleFilter),
    [query, roleFilter]
  );

  return (
    <div className="grid-2">
      <div className="stack">
        {/* Toolbar: Search + Batter Role Filter */}
        <Card padded={false} style={{ padding: "16px" }}>
          <div className="roster-toolbar" style={{ flexDirection: "column", gap: "12px", borderBottom: "none", padding: 0 }}>
            <div className="roster-search" style={{ width: "100%" }}>
              <Search size={15} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search cricket opportunities by title, location, role..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="roster-filters" style={{ width: "100%", overflowX: "auto" }}>
              {ROLE_FILTERS.map((role) => (
                <button
                  key={role}
                  className={`roster-filter${roleFilter === role ? " roster-filter--active" : ""}`}
                  onClick={() => setRoleFilter(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card>
            <LoadingBlock label="Loading cricket opportunities…" />
          </Card>
        ) : !posts || posts.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-tertiary)" }}>
              <Target size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
              <p>No cricket opportunities match this filter.</p>
            </div>
          </Card>
        ) : (
          <div className="opp-feed">
            {posts.map((post) => {
              const bRole = post.battingRole || "Opening Batter";
              const bStyle = post.battingStyle || "Either";
              const age = post.ageGroup || "U19";

              return (
                <Card key={post.id || post._id} className="opp-feed__card">
                  <div className="opp-feed__header">
                    <div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        <Badge tone={TYPE_TONE[post.type] || "teal"}>
                          {String(post.type).toUpperCase()}
                        </Badge>
                        <Badge variant="neutral">
                          ROLE: {bRole}
                        </Badge>
                      </div>
                      <h3 className="opp-feed__title" style={{ marginTop: "6px" }}>{post.title}</h3>
                      <p className="opp-feed__org">{post.org || post.creatorTeam || "Delhi Cricket Academy"}</p>
                    </div>
                    <p className="opp-feed__date">{formatDate(post.postedAt || post.createdAt)}</p>
                  </div>

                  <p className="opp-feed__summary">{post.summary}</p>

                  <div style={{ display: "flex", gap: "12px", margin: "12px 0 4px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                    <span><strong>Style:</strong> {bStyle}</span>
                    <span>•</span>
                    <span><strong>Age Group:</strong> {age}</span>
                  </div>

                  <div className="opp-feed__footer">
                    <div className="opp-feed__meta">
                      <span>
                        <MapPin size={13} /> {post.location}
                      </span>
                      <span>
                        <Users size={13} /> {post.applicants || 0} applicants
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <OpportunityComposer onPosted={refetch} />
      </div>
    </div>
  );
}
