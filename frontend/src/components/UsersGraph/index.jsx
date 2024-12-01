import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const UsersGraph = () => {
  const d3Container = useRef(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_USERS_PATH}`)
      .then(response => response.json())
      .then(data => {

        console.group('=== Users Graph Data Processing ===');

        // Log raw data years with better formatting
        console.log('📅 Raw data years:', data.map(d => d.year));

        const uniqueData = Array.from(new Set(data.map(d => d.year)))
        .map(year => {
            const yearEntries = data.filter(d => d.year === year);
            // Log entries for each year with better formatting
            console.log(`📊 Year ${year} entries:`, {
            count: yearEntries.length,
            details: yearEntries
            });
            return {
            year: year,
            count: yearEntries.reduce((sum, entry) => sum + entry.count, 0)
            };
        });

        // Log processed data with better formatting
        console.log('🔄 Processed unique data:', uniqueData);

        const parsedData = uniqueData.sort((a, b) => a.year - b.year);
        console.log('✅ Final sorted data:', parsedData);

        console.groupEnd();

        const svg = d3.select(d3Container.current);
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = +svg.attr('width') - margin.left - margin.right;
        const height = +svg.attr('height') - margin.top - margin.bottom;

        svg.selectAll('*').remove();

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
          .domain(parsedData.map(d => d.year))
          .range([0, width])
          .padding(0.1);

        const y = d3.scaleLinear()
          .domain([0, d3.max(parsedData, d => d.count)])
          .range([height, 0]);

        g.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x).tickFormat(d3.format('d')));

        g.append('g')
          .call(d3.axisLeft(y));

        const line = d3.line()
          .x(d => x(d.year))
          .y(d => y(d.count));

        g.append('path')
          .datum(parsedData)
          .attr('fill', 'none')
          .attr('stroke', '#69b3a2')
          .attr('stroke-width', 1.5)
          .attr('d', line);

        g.selectAll('circle')
          .data(parsedData)
          .enter()
          .append('circle')
          .attr('cx', d => x(d.year))
          .attr('cy', d => y(d.count))
          .attr('r', 5)
          .attr('fill', '#69b3a2');
      })
      .catch(error => console.error('Error fetching user data:', error));
  }, []);

  return (
    <svg
      ref={d3Container}
      width={600}
      height={400}
    />
  );
};

export default UsersGraph;