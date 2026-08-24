import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-spinner">
    <div className="spinner" />
    <span>{text}</span>
  </div>
);

export default LoadingSpinner;
