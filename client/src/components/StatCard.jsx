import React from "react";

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
          color === "green"
            ? "bg-tertiary text-white"
            : color === "blue"
            ? "bg-Blue text-white"
            : color === "red"
            ? "bg-Red text-white"
            : color === "yellow"
            ? "bg-Yellow text-secondary"
            : "bg-tertiary text-white"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
