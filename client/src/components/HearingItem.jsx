import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const HearingItem = ({ title, date }) => {
  return (
    <div className="flex items-start md:items-center p-3 md:p-4 border-b border-gray-100">
      <div className="bg-gray-100 p-2 rounded-md mr-2 md:mr-3 flex-shrink-0">
        <FaCalendarAlt className="text-gray-600 text-sm md:text-base" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm md:text-base break-words">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-gray-600">{date}</p>
      </div>
    </div>
  );
};

export default HearingItem;
