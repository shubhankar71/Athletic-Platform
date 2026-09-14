import { useMemo, useState } from "react";
import { Search, TrendingDown, TrendingUp, Minus, FlagTriangleRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getCoachAthletesApi } from "../../api/coachApi.js";
import AthleteProfileDrawer from "./AthleteProfileDrawer.jsx";
import "./AthleteRoster.css";

const BATTING_ROLES = [
  "All Batters",
  "Opening Batter",
  "Middle-Order Batter",
  "Wicketkeeper-Batter",
  "Finisher",
];

const TREND_ICON = {
  up: <TrendingUp size={14} color="var(--accent-teal)" />,
  down: <TrendingDown size={14} color="var(--accent-coral)" />,
  flat: <Minus size={14} color="var(--text-tertiary)" />,
};

export default function AthleteRoster() {
  const [roleFilter, setRoleFilter] = useState("All Batters");
  const [query, setQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const { data: roster, isLoading } = useAsyncData(
    () => getCoachAthletesApi({ search: query, battingRole: roleFilter }),
    [query, roleFilter]
  );

  const filtered = useMemo(() => {
    if (!roster) return [];
    return roster;
  }, [roster]);

  return (
    <div className="stack">
      <Card padded={false}>
        <div className="roster-toolbar">
          <div className="roster-search">
            <Search size={15} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search applicant athletes by name, role, opportunity..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="roster-filters">
            {BATTING_ROLES.map((role) => (
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

        {isLoading ? (
          <div style={{ padding: "0 24px 24px" }}>
            <LoadingBlock label="Loading applicant roster…" />
          </div>
        ) : (
          <table className="roster-table">
            <thead>
              <tr>
                <th>ATHLETE</th>
                <th>BATTING ROLE</th>
                <th>BATTING STYLE</th>
                <th>GENDER</th>
                <th>OPPORTUNITY APPLIED</th>
                <th>APPLICATION DATE</th>
                <th>STATUS</th>
                <th>LAST SCORE</th>
                <th style={{ textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((athlete) => {
                const bRole = athlete.battingRole || "Opening Batter";
                const bStyle = athlete.battingStyle || "Right-Handed";
                const score = athlete.lastSessionScore ?? 78;
                const formattedDate = athlete.applicationDate
                  ? new Date(athlete.applicationDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently";

                return (
                  <tr key={athlete.id || athlete._id} onClick={() => setSelectedAthlete(athlete)}>
                    <td className="roster-table__name">
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{athlete.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{athlete.email}</div>
                      {athlete.flagged && (
                        <FlagTriangleRight size={13} color="var(--signal-amber)" style={{ marginLeft: 6 }} />
                      )}
                    </td>
                    <td>
                      <Badge variant={bRole.includes("Opening") ? "teal" : bRole.includes("Middle") ? "coral" : "neutral"}>
                        {bRole}
                      </Badge>
                    </td>
                    <td>
                      <span className="roster-table__event">{bStyle}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{athlete.gender || "Male"}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {athlete.opportunityTitle || "Recruitment Opportunity"}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{formattedDate}</span>
                    </td>
                    <td>
                      <Badge tone={athlete.status === "Selected" ? "teal" : "neutral"}>
                        {athlete.status || "Applied"}
                      </Badge>
                    </td>
                    <td>
                      <span className="mono-stat">{score}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Badge tone="teal" style={{ cursor: "pointer" }}>VIEW</Badge>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="roster-table__empty">
                    No applicant athletes found. Athletes appear here once they apply to your published opportunities.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {selectedAthlete && (
        <AthleteProfileDrawer athlete={selectedAthlete} onClose={() => setSelectedAthlete(null)} />
      )}
    </div>
  );
}
