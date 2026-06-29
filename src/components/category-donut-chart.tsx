"use client";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface CategoryDonutChartProps {
  data: DonutSegment[];
  size?: number;
}

export function CategoryDonutChart({
  data,
  size = 64,
}: CategoryDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const strokeWidth = size * 0.2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulated = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={strokeWidth}
      />
      {data.map((segment, i) => {
        const pct = segment.value / total;
        const dashLength = circumference * pct;
        const offset = -circumference * accumulated;
        accumulated += pct;

        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
            strokeLinecap="butt"
          />
        );
      })}
    </svg>
  );
}
