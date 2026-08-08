import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="chart-tooltip__row" style={{ color: entry.color }}>
          <span>{entry.name}</span>
          <span className="mono-stat">{entry.value}%</span>
        </p>
      ))}
    </div>
  );
}

/**
 * @param {{session: string, accuracy: number, error: number}[]} data
 */
export default function AccuracyErrorChart({ data }) {
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="session"
            stroke="var(--text-tertiary)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--border-subtle)" }}
          />
          <YAxis
            stroke="var(--text-tertiary)"
            tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            width={34}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="accuracy"
            name="Accuracy"
            stroke="var(--accent-teal)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--accent-teal)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="error"
            name="Error rate"
            stroke="var(--accent-coral)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--accent-coral)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
