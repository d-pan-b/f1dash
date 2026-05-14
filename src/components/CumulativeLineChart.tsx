import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Brush,
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

/**
 * Recharts needs a definite pixel height on the wrapper (percent height in flex often resolves to 0).
 * Taller plot separates cumulative lines; brush sits in bottom margin.
 */
const CHART_PX = 700

export function CumulativeLineChart({ rows, series, seasonYear, subtitle = null }: Props) {
  const title = `${seasonYear} — cumulative points after each round (top 10)`
  const last = Math.max(0, rows.length - 1)

  const [brush, setBrush] = useState({ start: 0, end: last })

  useEffect(() => {
    const e = Math.max(0, rows.length - 1)
    setBrush({ start: 0, end: e })
  }, [rows, seasonYear])

  const isZoomed = brush.start > 0 || brush.end < last

  const resetZoom = useCallback(() => {
    setBrush({ start: 0, end: last })
  }, [last])

  const onBrushChange = useCallback(
    (e: { startIndex?: number; endIndex?: number }) => {
      setBrush((b) => ({
        start: typeof e.startIndex === 'number' ? Math.max(0, e.startIndex) : b.start,
        end: typeof e.endIndex === 'number' ? Math.min(last, e.endIndex) : b.end,
      }))
    },
    [last],
  )

  const showBrush = rows.length > 2

  const xTick = useMemo(
    () => ({ fontSize: rows.length > 18 ? 8 : rows.length > 14 ? 9 : 10 }),
    [rows.length],
  )

  return (
    <div className="recharts-wrap">
      <div className="recharts-wrap__titles">
        <h3 className="recharts-wrap__title">{title}</h3>
        {subtitle ? <p className="recharts-wrap__sub">{subtitle}</p> : null}
      </div>

      <div className="recharts-wrap__toolbar">
        <p className="recharts-wrap__hint">
          {showBrush
            ? 'Zoom rounds: drag the highlighted window or its handles below the axis.'
            : 'Not enough rounds yet for zoom — full season is shown.'}
        </p>
        {showBrush && isZoomed ? (
          <button type="button" className="recharts-wrap__reset" onClick={resetZoom}>
            Show all rounds
          </button>
        ) : null}
      </div>

      <div
        className="recharts-wrap__canvas"
        style={{ width: '100%', height: CHART_PX, minHeight: CHART_PX }}
      >
        <ResponsiveContainer width="100%" height="100%" debounce={32}>
          <LineChart
            data={rows}
            margin={{ top: 44, right: 18, left: 6, bottom: showBrush ? 112 : 72 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              interval={0}
              tick={{ fill: '#8b919d', ...xTick }}
              angle={rows.length > 14 ? -56 : -38}
              textAnchor="end"
              height={rows.length > 14 ? 86 : 72}
              tickMargin={6}
            />
            <YAxis
              tick={{ fill: '#8b919d', fontSize: 11 }}
              domain={[0, (max: number) => Math.ceil((max || 0) * 1.12) || 1]}
              width={48}
              allowDecimals={false}
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
              verticalAlign="top"
              align="right"
              height={34}
              wrapperStyle={{ top: 0, right: 4, fontSize: 11 }}
              formatter={(value) => <span style={{ color: '#c8ccd4', fontSize: 11 }}>{value}</span>}
            />
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.35}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                isAnimationActive
                animationDuration={650}
                connectNulls
              />
            ))}
            {showBrush ? (
              <Brush
                dataKey="label"
                height={40}
                stroke="rgba(225, 6, 0, 0.65)"
                fill="rgba(225, 6, 0, 0.12)"
                travellerWidth={10}
                startIndex={brush.start}
                endIndex={brush.end}
                onChange={onBrushChange}
                tickFormatter={() => ''}
                ariaLabel="Zoom chart to a range of rounds"
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
