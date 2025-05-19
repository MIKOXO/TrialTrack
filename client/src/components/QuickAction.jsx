import React from "react";
import { Link } from "react-router-dom";

const QuickAction = ({ icon, title, description, to }) => {
  return (
    <Link
      to={to}
      className="block bg-white rounded-lg shadow-lg p-4 hover:shadow-400 ease-in-out duration-300"
    >
      <div className="flex items-start">
        <div className="bg-green-100 p-2 rounded-md mr-3 text-green-600">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default QuickAction;
