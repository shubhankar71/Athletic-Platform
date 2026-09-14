import { useState, useMemo } from "react";
import { Search, Calendar, MapPin, CheckCircle, Tag, Clock } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getAthleteApplicationsApi } from "../../api/coachApi.js";
import "./AthleteHistory.css";

const BATTING_ROLES = [
  "All Roles",
  "Opening Batter",
  "Middle-Order Batter",
  "Wicketkeeper-Batter",
  "Finisher",
];

export default function AthleteHistory() {
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [query, setQuery] = useState("");

  const { data: applications, isLoading } = useAsyncData(
    () => getAthleteApplicationsApi({ search: query, battingRole: roleFilter }),
    [query, roleFilter]
  );

  const filteredApps = useMemo(() => {
    if (!applications) return [];
    return applications;
  }, [applications]);

  return (
    <div className="athlete-history stack">
      <Card padded={true}>
        <div className="athlete-history__header">
          <div>
            <p className="eyebrow">Application History</p>
            <h2 className="athlete-history__title">My Applied Opportunities</h2>
          </div>

          <div className="athlete-history__toolbar">
            <div className="athlete-history__search">
              <Search size={15} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Search applied opportunities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <select
              className="athlete-history__role-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {BATTING_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <LoadingBlock label="Loading application history…" />
        ) : (
          <div className="athlete-history__grid">
            {filteredApps.map((app) => {
              const formattedDate = app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Recently";

              return (
                <div key={app._id || app.id} className="app-card">
                  <div className="app-card__header">
                    <div>
                      <div className="app-card__tags">
                        <Badge variant={app.type === "recruitment" ? "teal" : "coral"}>
                          {app.type === "recruitment" ? "RECRUITMENT" : "TRIAL"}
                        </Badge>
                        <Badge tone="neutral">{app.battingRole || "Opening Batter"}</Badge>
                        <Badge tone="amber">Gender: {app.gender || "Any"}</Badge>
                      </div>
                      <h3 className="app-card__title">{app.title}</h3>
                    </div>

                    <Badge tone="teal" style={{ fontWeight: 700 }}>
                      FEE: {app.formattedFee || `₹${app.fee || 2000}`}
                    </Badge>
                  </div>

                  <p className="app-card__summary">{app.summary}</p>

                  <div className="app-card__meta">
                    <span>
                      <MapPin size={13} /> {app.location}
                    </span>
                    <span>
                      <Calendar size={13} /> Applied: {formattedDate}
                    </span>
                    <span>
                      Posted by: <strong>{app.creatorName || "Coach"}</strong> ({app.creatorTeam || "Delhi Cricket Club"})
                    </span>
                  </div>

                  <div className="app-card__footer">
                    <span className="app-card__status-label">
                      Application Status:
                    </span>
                    <Badge tone={app.status === "Selected" ? "teal" : "amber"}>
                      {app.status || "Applied"}
                    </Badge>
                  </div>
                </div>
              );
            })}

            {filteredApps.length === 0 && (
              <div className="athlete-history__empty">
                <p>No applied opportunities found in your history.</p>
                <p style={{ fontSize: "12px", marginTop: "4px", color: "var(--text-tertiary)" }}>
                  Browse the Opportunity Feed to find and apply to active cricket trials and recruitments.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
