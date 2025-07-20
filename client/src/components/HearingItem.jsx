import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaGavel,
} from "react-icons/fa";

const HearingItem = ({ title, date, time, court, judge }) => {
  return (
    <div className="flex items-start md:items-center p-3 md:p-4 border-b border-gray-100 last:border-b-0">
      <div className="bg-green-100 p-2 rounded-md mr-2 md:mr-3 flex-shrink-0">
        <FaCalendarAlt className="text-green-600 text-sm md:text-base" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-sm md:text-base break-words mb-1">
          {title}
        </h3>
        <div className="space-y-1">
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <FaCalendarAlt className="mr-1 w-3 h-3" />
            <span>{date}</span>
            {time && (
              <>
                <FaClock className="ml-3 mr-1 w-3 h-3" />
                <span>{time}</span>
              </>
            )}
          </div>
          {court && (
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-1 w-3 h-3" />
              <span>{court}</span>
            </div>
          )}
          {judge && (
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <FaGavel className="mr-1 w-3 h-3" />
              <span>Judge {judge}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HearingItem;
