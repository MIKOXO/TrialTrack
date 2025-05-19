import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const HearingItem = ({ title, date }) => {
  return (
    <div className="flex items-center p-3 border-b border-gray-100">
      <div className="bg-gray-100 p-2 rounded-md mr-3">
        <FaCalendarAlt className="text-gray-600" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{date}</p>
      </div>
    </div>
  );
};

export default HearingItem;
