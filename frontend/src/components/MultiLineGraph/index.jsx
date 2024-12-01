import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MultilineGraph = ({ data, filterType }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Check if data exists and has elements
    if (!data || !data.length || !data[0]?.values?.length) {
        return;
    }

    const margin = { top: 30, right: 100, bottom: 30, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Format data based on filter type
    const xDomain = filterType === 'Year' ? 
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] :
      d3.extent(data[0].values, d => d.x);

    const x = filterType === 'Year' ?
      d3.scaleBand()
        .domain(xDomain)
        .range([0, width])
        .padding(0.1) :
      d3.scaleLinear()
        .domain(xDomain)
        .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(d.values, v => v.y))])
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add X axis label
    svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width + margin.left)
    .attr("y", height + margin.bottom - 20)
    .style("fill", "white")
    .text(filterType === 'Year' ? "Months" : "Years");

    // Add Y axis label
    svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "start")
    .attr("y", -margin.top/2 - 2)
    .attr("x", margin.left - 90)
    .style("fill", "white")
    .text("Number of Movies");

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(["#e0ac2b", "#e85252", "#6689c6"]);

    // Add lines
    const line = d3.line()
      .x(d => filterType === 'Year' ? x(d.x) + x.bandwidth()/2 : x(d.x))
      .y(d => y(d.y));

    svg.selectAll(".line")
      .data(data)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", d => color(d.name))
      .attr("stroke-width", 2)
      .attr("d", d => line(d.values));

    // Add legend
    const legend = svg.selectAll(".legend")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(30,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => color(d.name));

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .style("fill", "white")
      .text(d => d.name);

  }, [data, filterType]);

    // Show loading or empty state if no data
    if (!data || !data.length) {
        return <div>No data available</div>;
    }

  return <svg ref={svgRef}></svg>;
};

export default MultilineGraph;