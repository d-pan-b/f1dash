import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartRow, SeriesLine } from '../lib/f1Api'

const tooltipStyle = {
  backgroundColor: 'rgba(16,18,24,0.94)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#e6e8ee',
}

interface Props {
  rows: ChartRow[]
  series: SeriesLine[]
  seasonYear: number
  subtitle?: string | null
}

/** Recharts needs a parent with a definite pixel height — % height inside flex/min-height only resolves to 0. */
const CHART_PX = 480

export function CumulativeLineChart({ rows, series, seasonYear, subtitle = null }: Props) {
  const title = `${seasonYear} — cumulative points after each round (top 10)`

  return (
    <div className="recharts-wrap">
      <div className="recharts-wrap__titles">
        <h3 className="recharts-wrap__title">{title}</h3>
        {subtitle ? <p className="recharts-wrap__sub">{subtitle}</p> : null}
      </div>
      <div
        className="recharts-wrap__canvas"
        style={{ width: '100%', height: CHART_PX, minHeight: CHART_PX }}
      >
        <ResponsiveContainer width="100%" height="100%" debounce={32}>
          <LineChart data={rows} margin={{ top: 8, right: 12, left: 8, bottom: 56 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fill: '#8b919d', fontSize: rows.length > 18 ? 8 : 10 }}
              angle={rows.length > 14 ? -56 : -38}
              textAnchor="end"
              height={rows.length > 14 ? 86 : 72}
              tickMargin={6}
            />
            <YAxis
              tick={{ fill: '#8b919d', fontSize: 11 }}
              domain={[0, 'auto']}
              width={44}
              label={{
                value: 'Points',
                angle: -90,
                position: 'insideLeft',
                fill: '#8b919d',
                fontSize: 12,
                offset: 4,
              }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
            />
            <Legend
              verticalAlign="bottom"
              height={72}
              wrapperStyle={{ paddingTop: 12 }}
              formatter={(value) => <span style={{ color: '#c8ccd4', fontSize: 11 }}>{value}</span>}
            />
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={700}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
