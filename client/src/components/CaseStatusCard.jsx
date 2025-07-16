import React from "react";

const CaseStatusCard = ({ title, count }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h3 className="text-gray-600 font-medium mb-1 md:mb-2 text-sm md:text-base">
        {title}
      </h3>
      <p className="text-2xl md:text-3xl font-bold">{count}</p>
    </div>
  );
};

export default CaseStatusCard;
