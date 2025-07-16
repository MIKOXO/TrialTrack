import React from "react";

const CaseItem = ({ title, caseNumber, description, status, filedDate }) => {
  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Active
          </span>
        );
      case "open":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-500">
            Open
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  return (
    <div className="px-3 md:px-4 border-b border-gray-200 py-3 md:py-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2 sm:gap-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-base md:text-lg font-medium break-words">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500">{caseNumber}</p>
        </div>
        <div className="flex-shrink-0">{getStatusBadge()}</div>
      </div>
      <p className="text-xs md:text-sm text-gray-600 mb-2 break-words">
        {description}
      </p>
      <p className="text-xs text-gray-500">Filed on {filedDate}</p>
    </div>
  );
};

export default CaseItem;
