import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import './styles.css';

const WordCloud = ({ data }) => {
    const svgRef = useRef();   
    const containerRef = useRef();
    const wordsRef = useRef([]);
    const animationRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Handle resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Render word cloud
    useEffect(() => {
        if (!data || dimensions.width === 0 || dimensions.height === 0) return;

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();
        
        const filteredData = data.filter(d => d.genre !== "Unknown");
        
        // Scale setup
        const minSize = 12;
        const maxSize = Math.min(dimensions.width, dimensions.height) / 10;
        const sizeScale = d3.scaleLinear()
            .domain([d3.min(filteredData, d => d.count), d3.max(filteredData, d => d.count)])
            .range([minSize, maxSize]);

        // SVG setup
        const svg = d3.select(svgRef.current)
            .attr('width', dimensions.width)
            .attr('height', dimensions.height)
            .append('g')
            .attr('transform', `translate(${dimensions.width / 2}, ${dimensions.height / 2})`);

        // Color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Cloud layout
        const layout = cloud()
            .size([dimensions.width, dimensions.height])
            .words(filteredData.map(d => ({ 
                text: d.genre, 
                size: sizeScale(d.count),
                value: d.count ,
                // Initial velocities
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            })))
            .padding(5)
            .rotate(() => 0)
            .fontSize(d => d.size)
            .spiral('archimedean')
            .on('end', draw);

        function draw(words) {
            wordsRef.current = words;
            svg.selectAll('text')
                .data(words)
                .enter().append('text')
                .attr('class', 'word')
                .style('font-size', d => `${d.size}px`)
                .style('font-family', 'Arial')
                .style('fill', (d, i) => color(i))
                .attr('text-anchor', 'middle')
                .attr('transform', d => `translate(${d.x}, ${d.y})`)
                .text(d => d.text)
                .append('title') // Tooltip
                .text(d => `${d.text}: ${d.value}`);

            animate();
        }

        function animate() {
            wordsRef.current.forEach(word => {
                // Update position
                word.x += word.vx;
                word.y += word.vy;
        
                // Calculate boundaries including word size
                const padding = word.size / 2; // Half the font size for better boundary calculation
                const maxX = (dimensions.width / 2) - padding;
                const maxY = (dimensions.height / 2) - padding - 55;
                
                // Keep within bounds
                if (word.x > maxX) {
                    word.x = maxX;
                    word.vx *= -1;
                } else if (word.x < -maxX) {
                    word.x = -maxX;
                    word.vx *= -1;
                }
                
                if (word.y > maxY) {
                    word.y = maxY;
                    word.vy *= -1;
                } else if (word.y < -maxY) {
                    word.y = -maxY;
                    word.vy *= -1;
                }
        
                // Add small friction to prevent excessive speed
                word.vx *= 0.99;
                word.vy *= 0.99;
                
                // Maintain minimum speed
                const minSpeed = 0.4;
                const speed = Math.sqrt(word.vx * word.vx + word.vy * word.vy);
                if (speed < minSpeed) {
                    const scale = minSpeed / speed;
                    word.vx *= scale;
                    word.vy *= scale;
                }
            });

            // Update positions with transition
            svg.selectAll('.word')
                .data(wordsRef.current)
                .transition()
                .duration(16)
                .attr('transform', d => `translate(${d.x}, ${d.y})`);

            animationRef.current = requestAnimationFrame(animate);
        }

        layout.start();

        // Cleanup
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [data, dimensions]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }}>
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
        </div>
    );
};

export default WordCloud;