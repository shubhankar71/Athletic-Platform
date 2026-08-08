import { useMemo, useState } from "react";
import { Search, TrendingDown, TrendingUp, Minus, FlagTriangleRight } from "lucide-react";
import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import { LoadingBlock } from "../ui/LoadingState.jsx";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import { getAthleteRoster } from "../../api/mockApi.js";
import { SPORTS } from "../../data/mockData.js";
import AthleteProfileDrawer from "./AthleteProfileDrawer.jsx";
import "./AthleteRoster.css";

const TREND_ICON = {
  up: <TrendingUp size={14} color="var(--accent-teal)" />,
  down: <TrendingDown size={14} color="var(--accent-coral)" />,
  flat: <Minus size={14} color="var(--text-tertiary)" />,
};

export default function AthleteRoster() {
  const { data: roster, isLoading } = useAsyncData(getAthleteRoster, []);
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [query, setQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  const filtered = useMemo(() => {
    if (!roster) return [];
    return roster.filter((a) => {
      const matchesSport = sportFilter === "All Sports" || a.sport === sportFilter;
      const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase());
      return matchesSport && matchesQuery;
    });
  }, [roster, sportFilter, query]);

  return (
    <div className="stack">
      <Card padded={false}>
        <div className="roster-toolbar">
          <div className="roster-search">
            <Search size={15} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search athletes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="roster-filters">
            {SPORTS.map((sport) => (
              <button
                key={sport}
                className={`roster-filter${sportFilter === sport ? " roster-filter--active" : ""}`}
                onClick={() => setSportFilter(sport)}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: "0 24px 24px" }}>
            <LoadingBlock label="Loading roster…" />
          </div>
        ) : (
          <table className="roster-table">
            <thead>
              <tr>
                <th>Athlete</th>
                <th>Sport / Event</th>
                <th>Team</th>
                <th>Last score</th>
                <th>Trend</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((athlete) => (
                <tr key={athlete.id} onClick={() => setSelectedAthlete(athlete)}>
                  <td className="roster-table__name">
                    {athlete.name}
                    {athlete.flagged && (
                      <FlagTriangleRight size={13} color="var(--signal-amber)" style={{ marginLeft: 6 }} />
                    )}
                  </td>
                  <td>
                    <span className="roster-table__event">{athlete.event}</span>
                    <span className="roster-table__sport">{athlete.sport}</span>
                  </td>
                  <td>{athlete.team}</td>
                  <td>
                    <span className="mono-stat">{athlete.lastSessionScore}</span>
                  </td>
                  <td>{TREND_ICON[athlete.trend]}</td>
                  <td>
                    <Badge tone="neutral">View</Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="roster-table__empty">
                    No athletes match this filter.
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
