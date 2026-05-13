import React from 'react';

const DonutChart = ({ percentage, color = "var(--primary-blue)", size = 120, trackWidth = 15 }) => {
  const radius = (size - trackWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-color)"
          strokeWidth={trackWidth}
        />
        {/* Progress indicator */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={trackWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      {/* Label inside the donut */}
      <div style={{ position: 'absolute', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>
        {percentage}%
      </div>
    </div>
  );
};

export default DonutChart;
