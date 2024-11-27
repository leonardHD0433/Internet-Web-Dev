import React, { useMemo } from "react";
import * as d3 from "d3";

const MARGIN = 50;
const BAR_PADDING = 0.2;

type CircularBarplotProps = {
  width: number;
  height: number;
  data: { category: string; value: number }[];
};

export const CircularBarplot = ({
  width,
  height,
  data,
}: CircularBarplotProps) => {
  const innerRadius = 90;
  const outerRadius = Math.min(width, height) / 2 - MARGIN;

  const groups = data.sort((a, b) => b.value - a.value).map((d) => d.category);
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(groups)
      .range([0, 2 * Math.PI])
      .padding(BAR_PADDING);
  }, [data, height, width]);

  const yScale = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => d.value));
    return d3
      .scaleRadial()
      .domain([0, max || 10])
      .range([innerRadius, outerRadius]);
  }, [data, width, height]);

  // Build the shapes
  const arcPathGenerator = d3.arc();
  const allShapes = data.map((group, i) => {
    const path = arcPathGenerator({
      innerRadius: innerRadius,
      outerRadius: yScale(group.value),
      startAngle: xScale(group.category) ?? 0,
      endAngle: (xScale(group.category) ?? 0) + xScale.bandwidth(),
    }) || "";

    const barAngle = (xScale(group.category) ?? 0) + xScale.bandwidth() / 2; // (in Radian)
    const turnLabelUpsideDown = (barAngle + Math.PI) % (2 * Math.PI) < Math.PI;
    const labelRotation = (barAngle * 180) / Math.PI - 90; // (convert radian to degree)
    const labelXTranslation = yScale(group.value) + 10;
    const labelTransform =
      "rotate(" +
      labelRotation +
      ")" +
      ",translate(" +
      labelXTranslation +
      ",0)";

    return (
      <g key={i}>
        <path
          d={path}
          opacity={0.7}
          stroke="#28a745"
          fill="#28a745"
          fillOpacity={0.5}
          strokeWidth={1}
          rx={1}
        />
        <title>{`Number of Actors: ${new Intl.NumberFormat().format(group.value)}`}</title>
        <g transform={labelTransform}>
          <text
            textAnchor={turnLabelUpsideDown ? "end" : "start"}
            alignmentBaseline="middle"
            fontSize={20}
            transform={turnLabelUpsideDown ? "rotate(180)" : "rotate(0)"}
            fill="#f5f5f5"
          >
            {group.category}
          </text>
        </g>
      </g>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g transform={"translate(" + width / 2 + "," + height / 2 + ")"}>
          {allShapes}
        </g>
      </svg>
    </div>
  );
};
export default CircularBarplot;