import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip,
} from 'recharts';

const RadarChartCompare = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available for comparison</div>;
  }

  // Determine the maximum value for the domain
  const maxValue = Math.ceil(
    Math.max(
      ...data.flatMap((d) =>
        Object.values(d).filter((value) => typeof value === 'number')
      )
    )
  );

  // Extract movie titles
  const movieTitles = Object.keys(data[0]).filter((key) => key !== 'subject');

  // Define colors for each movie
  const colors = ['#8884d8', '#82ca9d'];

  return (
    <RadarChart
      cx="50%"
      cy="50%"
      outerRadius="80%"
      width={1000}
      height={400}
      data={data}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <PolarRadiusAxis angle={30} domain={[0, maxValue]} />
      {movieTitles.map((title, index) => (
        <Radar
          key={index}
          name={title}
          dataKey={title}
          stroke={colors[index % colors.length]}
          fill={colors[index % colors.length]}
          fillOpacity={0.6}
        />
      ))}
      <Legend />
      <Tooltip />
    </RadarChart>
  );
};

export default RadarChartCompare;