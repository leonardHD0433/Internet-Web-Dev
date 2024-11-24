import React from 'react';
import './styles.css';

const Meter = ({ value }) => {
    console.log(value);
    if (value ===-1|| value === undefined || value === null) {
        return <div className="no-rating">No Available Rating</div>;
    }

    const angle = (value / 100) * 180; // Convert value to angle (0 to 180 degrees)

    return (
        <div className="half-circle-meter-container">
            <svg className="half-circle-meter" viewBox="0 0 100 50">
                <path
                    className="half-circle"
                    d="M 10,50 A 40,40 0 0,1 90,50"
                    stroke="url(#gradient)"
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
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="10" /* Adjusted y2 to make the needle smaller */
                    style={{ transform: `rotate(${angle}deg)` }}
                />
            </svg>
        </div>
    );
};

export default Meter;