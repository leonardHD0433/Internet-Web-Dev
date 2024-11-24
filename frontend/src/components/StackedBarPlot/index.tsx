//  Graph adapted and modified from: 
//  Title: Vertical Stacked Bar Plot
//  Author: The React Graph Gallery
//  Date: 2024
//  Code version: -
//  Availability: https://www.react-graph-gallery.com/example/barplot-stacked-vertical
 
import React, { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import './index.css';

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

type Group = {
  x: string;
} & { [key: string]: number };

type StackedBarplotProps = {
  width: number;
  height: number;
  data: Group[];
  allSubgroups: string[];
};

export const StackedBarplot = ({
  width,
  height,
  data,
  allSubgroups,
}: StackedBarplotProps) => {
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  const allGroups = data.map((d) => String(d.x));

  const stackSeries = d3.stack().keys(allSubgroups).order(d3.stackOrderNone);
  const series = stackSeries(data);

  const max = 100; // todo
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, max || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  const xScale = useMemo(() => {
    return d3
      .scaleBand<string>()
      .domain(allGroups)
      .range([0, boundsWidth])
      .padding(0.05);
  }, [data, width]);

  var colorScale = d3
    .scaleOrdinal<string>()
    .domain(allGroups)
    .range([
      "#000075", "#800000", "#9a6324", "#4363d8", "#808000",
      "#e6194b", "#f58231", "#008080", "#3cb44b", "#808080",
      "#46f0f0", "#bcf60c", "#ffe119", "#fabebe", "#ffd8b1",
      "#fffac8", "#e6beff", "#f032e6", "#911eb4", "#aaffc3"
    ]);

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

  useEffect(() => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")

    const handleMouseOver = (event, d) => {
      tooltip.style("display", "block");
    };

    const handleMouseMove = (event, d) => {
      const subgroupName = d3.select(event.target).attr("data-subgroup");
      const value = d3.select(event.target).attr("data-value");
      tooltip
        .html(`Genre: ${subgroupName}<br>Number of movies: ${value}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    };

    const handleMouseOut = () => {
      tooltip.style("display", "none");
    };

    d3.selectAll("rect")
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut);

    return () => {
      tooltip.remove();
    };
  }, [series]);

  const rectangles = series.map((subgroup, i) => {
    return (
      <g key={i}>
        {subgroup.map((group, j) => {
          return (
            <rect
              key={j}
              x={xScale(String(group.data.x))}
              y={yScale(group[1])}
              height={yScale(group[0]) - yScale(group[1])}
              width={xScale.bandwidth()}
              fill={colorScale(subgroup.key)}
              opacity={0.9}
              data-subgroup={subgroup.key}
              data-value={group[1] - group[0]}
            ></rect>
          );
        })}
      </g>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {rectangles}
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