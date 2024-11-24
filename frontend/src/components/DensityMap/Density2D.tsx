import React from "react";
import { hexbin } from "d3-hexbin";
import * as d3 from "d3"; // we will need d3.js

type DataPoint = {
    x: number;
    y: number;
  };

type Density2dProps = {
  width: number;
  height: number;
  data: DataPoint[];
};

export const Density2d = ({ width, height, data }: Density2dProps) => {

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x) as [number, number])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y) as [number, number])
        .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateInferno)
        .domain([0, d3.max(data, d => d.y) || 1]);

    const hexbinGenerator = hexbin()
        .radius(5) // hexagon size in px
        .extent([
        [0, 0],
        [50, 50],
    ]);

    const hexbinData = hexbinGenerator(
        data.map((item) => [xScale(item.x), yScale(item.y)])
    );

    const allShapes = hexbinData.map((d, i) => {
        return (
          <path
            key={i}
            d={hexbinGenerator.hexagon()}
            transform={"translate(" + d.x + "," + d.y + ")"}
            fill={colorScale(d.length)}
          />
        );
      });


  return (
    <div>
      <svg width={width} height={height}>
        // render all the hexagons
      </svg>
    </div>
  );
};