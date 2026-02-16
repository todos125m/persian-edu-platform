'use client';

interface ChartData {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  type?: 'bar' | 'line';
  color?: string;
  height?: number;
}

export default function Chart({
  data,
  type = 'bar',
  color = '#3b82f6',
  height = 200,
}: ChartProps) {
  if (!data.length) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 10, right: 10, bottom: 30, left: 10 };
  const chartWidth = 100;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  if (type === 'bar') {
    const barWidth = innerWidth / data.length;
    const gap = barWidth * 0.2;

    return (
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((d, i) => {
          const barH = (d.value / maxValue) * innerHeight;
          const x = padding.left + i * barWidth + gap / 2;
          const y = padding.top + innerHeight - barH;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth - gap}
                height={barH}
                rx={1}
                fill={color}
                opacity={0.85}
              />
              <text
                x={x + (barWidth - gap) / 2}
                y={chartHeight - 5}
                textAnchor="middle"
                className="text-[3px] fill-gray-500"
                style={{ fontFamily: 'Vazirmatn' }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // Line chart
  const stepX = innerWidth / (data.length - 1 || 1);
  const points = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + innerHeight - (d.value / maxValue) * innerHeight,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={areaPath} fill={color} opacity={0.1} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={0.8} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={1.2} fill={color} />
          <text
            x={p.x}
            y={chartHeight - 5}
            textAnchor="middle"
            className="text-[3px] fill-gray-500"
            style={{ fontFamily: 'Vazirmatn' }}
          >
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}
