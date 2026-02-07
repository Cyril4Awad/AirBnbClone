import React from "react";

function Loading({ message = "Loading..." }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div 
          className="spinner-border mb-3" 
          style={{ width: "3rem", height: "3rem", color: "#2c3e50" }} 
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 style={{ color: "#2c3e50" }}>{message}</h5>
      </div>
    </div>
  );
}

export default Loading;
