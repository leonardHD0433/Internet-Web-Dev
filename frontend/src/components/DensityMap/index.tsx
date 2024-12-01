import React, { useEffect,useRef,useMemo } from "react";
import { ScaleLinear } from "d3";
import * as d3 from "d3";
//import { AxisLeft } from "./AxisLeft";
//import { AxisBottom } from "./AxisBottom";
import { hexbin } from "d3-hexbin";

const MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };
const BIN_SIZE = 9;

type HexbinProps = {

  width: number;
  height: number;
  data: { x: number; y: number }[];
  allSubGroups: string[];
};

export const Hexbin = ({ width, height, data, allSubGroups}: HexbinProps) => {
  // Layout. The div size is set by the given props.
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const xValues = data.map(d => d.x);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);

  // Scales
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([xMin, xMax])
      .range([0, boundsWidth]);
  }, [xMin, xMax, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleBand<string>()
      .domain(allSubGroups)
      .range([0, boundsHeight])
      .padding(0.05);
  }, [allSubGroups, boundsHeight]);

  const hexbinGenerator = hexbin()
    .radius(BIN_SIZE)
    .extent([
      [0, 0],
      [boundsWidth, boundsHeight],
    ]);

  const hexbinData = hexbinGenerator(
    data.map((item) => [xScale(item.x), yScale(String(item.y))]).filter((d): d is [number, number] => d[1] !== undefined)
  );

  const maxItemPerBin = Math.max(...hexbinData.map((hex) => hex.length));

  const colorScale = d3
    .scaleSqrt<string>()
    .domain([0, maxItemPerBin])
    .range(["black", "#cb1dd1"]);

  const opacityScale = d3
    .scaleLinear<number>()
    .domain([0, maxItemPerBin])
    .range([0.2, 1]);

    
    useEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll("*").remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append("g")
      .attr("transform", "translate(0," + boundsHeight + ")")
      .call(xAxisGenerator);

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement.append("g").call(yAxisGenerator);
  }, [xScale, yScale, boundsHeight]);


  // Build the shapes
  const allShapes = hexbinData.map((d, i) => {
    return (
      <path
        key={i}
        d={hexbinGenerator.hexagon()}
        transform={"translate(" + d.x + "," + d.y + ")"}
        opacity={1}
        stroke={"white"}
        fill={colorScale(d.length)}
        // fillOpacity={opacityScale(d.length)}
        strokeOpacity={opacityScale(d.length)}
        strokeWidth={0.5}
      />
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        {/* first group is for the violin and box shapes */}
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
        {allShapes}
        </g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
    </div>
  );
};
