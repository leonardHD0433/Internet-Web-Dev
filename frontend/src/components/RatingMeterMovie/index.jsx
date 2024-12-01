import React from 'react';
import './styles.css';

const Meter = ({ value }) => {
    console.log(value);
    if (value === -1 || value === undefined || value === null) {
        return <div className="no-rating">No Available Rating</div>;
    }

    const angle = (value / 100) * 180; // Convert value to angle (0 to 180 degrees)
    console.log("Angle: ", angle);

    // Calculate stroke width based on angle
    const strokeWidth = 10 - (Math.abs(angle - 90) / 90) * 3; // Decrease stroke width as angle approaches 90 degrees

    return (
        <div className="rating-meter-movie-container" style={{ width: '300px', height: '150px' }}>
            <svg className="rating-meter-movie" viewBox="0 0 300 150">
                <path
                    className="half-circle"
                    d="M 30,150 A 120,120 0 0,1 270,150"
                    stroke="url(#gradient)"
                    strokeWidth="15"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: 'red', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: 'yellow', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'green', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                <line
                    className="needle"
                    x1="150"
                    y1="150"
                    x2="30"
                    y2="150" /* Adjusted y2 to make the needle smaller */
                    style={{ transform: `rotate(${angle}deg)`, transformOrigin: '150px 150px', strokeWidth: strokeWidth }}
                />
            </svg>
        </div>
    );
};

export default Meter;