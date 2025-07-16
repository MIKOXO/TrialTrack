import React from "react";
import { Link } from "react-router-dom";

const QuickAction = ({ icon, title, description, to }) => {
  return (
    <Link
      to={to}
      className="block bg-white rounded-lg shadow-lg p-3 md:p-4 hover:shadow-400 ease-in-out duration-300 touch-manipulation"
    >
      <div className="flex items-start md:items-center gap-3 md:gap-4">
        <div className="bg-green-100 p-2 rounded-md text-green-600 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-800 text-sm md:text-base">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default QuickAction;
