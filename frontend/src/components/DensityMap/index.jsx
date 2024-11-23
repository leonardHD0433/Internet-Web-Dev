import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './styles.css'; 

const DensityPlot = ({ data }) => {
    const svgRef = useRef();

    useEffect(() => {
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .classed('density-plot', true); // Add the CSS class

        // Create scales
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain(d3.extent(data, d => d.y))
            .range([height, 0]);

        // Add X axis
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        // Add Y axis
        svg.append('g')
            .call(d3.axisLeft(y));

        // Compute the density data
        const densityData = d3.contourDensity()
            .x(d => x(d.x))
            .y(d => y(d.y))
            .size([width, height])
            .bandwidth(20)
            (data);

        // Add the density contours
        svg.selectAll('path')
            .data(densityData)
            .enter().append('path')
            .attr('d', d3.geoPath())
            .classed('density-plot', true); // Add the CSS class

    }, [data]);

    return (
        <svg ref={svgRef}></svg>
    );
};

export default DensityPlot;