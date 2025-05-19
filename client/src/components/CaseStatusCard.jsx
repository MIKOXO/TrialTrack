import React from "react";

const CaseStatusCard = ({ title, count }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-600  font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
};

export default CaseStatusCard;
