import React from "react";

const ResponsiveTable = ({
  columns,
  data,
  onRowClick,
  className = "",
  emptyMessage = "No data available",
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
    >
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-gray-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-gray-900 break-words"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {data.map((row, index) => (
          <div
            key={index}
            className={`p-4 border-b border-gray-200 last:border-b-0 ${
              onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
            }`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column, colIndex) => {
              // Skip empty values and actions column for cleaner mobile view
              const value = column.render
                ? column.render(row[column.key], row)
                : row[column.key];
              if (!value || column.hideOnMobile) return null;

              return (
                <div
                  key={colIndex}
                  className="flex justify-between items-start mb-2 last:mb-0"
                >
                  <span className="text-sm font-medium text-gray-600 mr-2">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="text-sm text-gray-900 text-right flex-1">
                    {value}
                  </span>
                </div>
              );
            })}

            {/* Mobile Actions */}
            {columns.find((col) => col.key === "actions") && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {columns
                  .find((col) => col.key === "actions")
                  .render(row.actions, row)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResponsiveTable;
