import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JudgeLayout from "../../components/JudgeLayout";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaPlus,
  FaEllipsisH,
  FaEdit,
  FaTrashAlt,
  FaEye,
} from "react-icons/fa";

const JudgeCalendar = () => {
  const [hearings, setHearings] = useState([
    {
      id: 1,
      caseTitle: "Smith vs. Johnson",
      caseNumber: "C-2023-089",
      caseId: 1,
      date: "2023-11-20",
      time: "10:00",
      location: "Courtroom 302",
      status: "Upcoming",
      parties: ["John Smith", "Robert Johnson"],
      notes: "Initial hearing for criminal case",
      type: "Criminal",
    },
    {
      id: 2,
      caseTitle: "Wilson vs. Harvey",
      caseNumber: "C-2023-065",
      caseId: 2,
      date: "2023-12-05",
      time: "14:30",
      location: "Courtroom 201",
      status: "Upcoming",
      parties: ["James Wilson", "Thomas Harvey"],
      notes: "Preliminary hearing for civil dispute",
      type: "Civil",
    },
    {
      id: 3,
      caseTitle: "Lewis Dispute",
      caseNumber: "C-2023-035",
      caseId: 3,
      date: "2023-12-15",
      time: "09:00",
      location: "Courtroom 105",
      status: "Upcoming",
      parties: ["Sarah Lewis", "Michael Lewis"],
      notes: "Property division hearing",
      type: "Civil",
    },
    {
      id: 4,
      caseTitle: "State vs. Thompson",
      caseNumber: "C-2023-090",
      caseId: 4,
      date: "2023-10-15",
      time: "11:00",
      location: "Courtroom 302",
      status: "Completed",
      parties: ["State", "James Thompson"],
      notes: "Case dismissed",
      type: "Criminal",
    },
    {
      id: 5,
      caseTitle: "John vs. Jane",
      caseNumber: "C-2023-075",
      caseId: 5,
      date: "2023-11-10",
      time: "13:00",
      location: "Courtroom 201",
      status: "Completed",
      parties: ["John Doe", "Jane Doe"],
      notes: "Custody hearing",
      type: "Civil",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newHearing, setNewHearing] = useState({
    caseTitle: "",
    caseNumber: "",
    date: "",
    time: "",
    location: "",
    parties: [],
    notes: "",
    type: "Civil",
  });
  const [availableCases, setAvailableCases] = useState([
    {
      id: 1,
      title: "Smith vs. Johnson",
      caseNumber: "C-2023-089",
      type: "Criminal",
    },
    {
      id: 2,
      title: "Wilson vs. Harvey",
      caseNumber: "C-2023-065",
      type: "Civil",
    },
    { id: 3, title: "Lewis Dispute", caseNumber: "C-2023-035", type: "Civil" },
    {
      id: 6,
      title: "Alison vs. Miles",
      caseNumber: "C-2023-085",
      type: "Criminal",
    },
    {
      id: 7,
      title: "Roberts Family Matter",
      caseNumber: "C-2023-095",
      type: "Family",
    },
    {
      id: 8,
      title: "Commercial Dispute",
      caseNumber: "C-2023-105",
      type: "Commercial",
    },
  ]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [partyInput, setPartyInput] = useState("");

  // Group hearings by date
  const groupHearingsByDate = () => {
    const grouped = {};
    hearings.forEach((hearing) => {
      const date = hearing.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(hearing);
    });
    return grouped;
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();

    // Total days in the month
    const daysInMonth = lastDay.getDate();

    // Calendar array with 6 weeks (42 days) to ensure we have enough space
    const calendar = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendar.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendar.push(new Date(year, month, day));
    }

    // Add empty cells to complete the last week if needed
    while (calendar.length % 7 !== 0) {
      calendar.push(null);
    }

    return calendar;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(formatDate(date));
  };

  const handleActionClick = (hearingId) => {
    if (actionMenuOpen === hearingId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(hearingId);
    }
  };

  const handleDeleteHearing = (hearingId) => {
    if (window.confirm("Are you sure you want to delete this hearing?")) {
      setHearings(hearings.filter((hearing) => hearing.id !== hearingId));
      setActionMenuOpen(null);
    }
  };

  const openScheduleModal = (date) => {
    setNewHearing({
      ...newHearing,
      date: date || formatDate(new Date()),
    });
    setShowScheduleModal(true);
  };

  const handleCaseSelect = (e) => {
    const caseId = parseInt(e.target.value);
    const selectedCase = availableCases.find((c) => c.id === caseId);

    if (selectedCase) {
      setSelectedCase(selectedCase);
      setNewHearing({
        ...newHearing,
        caseTitle: selectedCase.title,
        caseNumber: selectedCase.caseNumber,
        type: selectedCase.type,
      });
    }
  };

  const handleAddParty = () => {
    if (partyInput.trim()) {
      setNewHearing({
        ...newHearing,
        parties: [...newHearing.parties, partyInput.trim()],
      });
      setPartyInput("");
    }
  };

  const handleRemoveParty = (index) => {
    const updatedParties = [...newHearing.parties];
    updatedParties.splice(index, 1);
    setNewHearing({
      ...newHearing,
      parties: updatedParties,
    });
  };

  const handleScheduleHearing = () => {
    if (
      !newHearing.caseTitle ||
      !newHearing.date ||
      !newHearing.time ||
      !newHearing.location
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const newHearingObj = {
      id: hearings.length + 1,
      caseTitle: newHearing.caseTitle,
      caseNumber: newHearing.caseNumber,
      caseId: selectedCase?.id || 0,
      date: newHearing.date,
      time: newHearing.time,
      location: newHearing.location,
      status: "Upcoming",
      parties: newHearing.parties,
      notes: newHearing.notes,
      type: newHearing.type,
    };

    setHearings([...hearings, newHearingObj]);
    setShowScheduleModal(false);
    setNewHearing({
      caseTitle: "",
      caseNumber: "",
      date: "",
      time: "",
      location: "",
      parties: [],
      notes: "",
      type: "Civil",
    });
    setSelectedCase(null);
  };

  // Get hearings for selected date
  const getHearingsForSelectedDate = () => {
    if (!selectedDate) return [];
    return hearings.filter((hearing) => hearing.date === selectedDate);
  };

  const calendarDays = generateCalendarDays();
  const hearingsByDate = groupHearingsByDate();
  const selectedDateHearings = getHearingsForSelectedDate();

  return (
    <section>
      <JudgeLayout>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Calendar</h1>
          <p className="text-gray-600">
            View and manage your court hearings schedule
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={previousMonth}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  &lt; Previous
                </button>
                <h2 className="text-lg font-medium">
                  {formatMonthYear(currentMonth)}
                </h2>
                <button
                  onClick={nextMonth}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Next &gt;
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <div
                      key={index}
                      className="text-center font-medium py-2 text-gray-600"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const dateStr = day ? formatDate(day) : "";
                  const hasHearings = day && hearingsByDate[dateStr];
                  const isToday =
                    day && formatDate(day) === formatDate(new Date());
                  const isSelected = day && formatDate(day) === selectedDate;

                  return (
                    <div
                      key={index}
                      className={`border p-1 min-h-[80px] ${
                        !day ? "bg-gray-100" : ""
                      } ${isToday ? "bg-blue-50 border-blue-300" : ""}
                    ${isSelected ? "bg-green-50 border-green-500" : ""}
                    ${day ? "cursor-pointer hover:bg-gray-50" : ""}`}
                      onClick={() => day && handleDateClick(day)}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-center mb-1">
                            <span
                              className={`text-sm ${
                                isToday ? "font-bold" : ""
                              }`}
                            >
                              {day.getDate()}
                            </span>
                            {dateStr === selectedDate && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openScheduleModal(dateStr);
                                }}
                                className="text-green-600 hover:text-green-700 text-xs"
                                title="Schedule hearing"
                              >
                                <FaPlus />
                              </button>
                            )}
                          </div>
                          {hasHearings && (
                            <div>
                              {hearingsByDate[dateStr].map((hearing) => (
                                <div
                                  key={hearing.id}
                                  className="text-xs p-1 mb-1 rounded bg-green-100 text-green-800 truncate"
                                  title={hearing.caseTitle}
                                >
                                  {hearing.time} - {hearing.caseTitle}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Date Hearings */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Hearings for{" "}
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <button
                    onClick={() => openScheduleModal(selectedDate)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                  >
                    <FaPlus className="mr-1" /> Schedule Hearing
                  </button>
                </div>

                {selectedDateHearings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hearings scheduled for this date.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedDateHearings.map((hearing) => (
                      <div
                        key={hearing.id}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-lg">
                              {hearing.caseTitle}
                            </h3>
                            <p className="text-gray-500 text-sm mb-2">
                              Case #{hearing.caseNumber}
                            </p>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => handleActionClick(hearing.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FaEllipsisH />
                            </button>

                            {actionMenuOpen === hearing.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <Link
                                    to={`/judge/hearings/${hearing.id}`}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FaEye className="mr-2" /> View Details
                                  </Link>
                                  <Link
                                    to={`/judge/cases/${hearing.caseId}`}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FaEdit className="mr-2" /> Edit Hearing
                                  </Link>
                                  <button
                                    onClick={() =>
                                      handleDeleteHearing(hearing.id)
                                    }
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FaTrashAlt className="mr-2" /> Delete
                                    Hearing
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 mt-3">
                          <div className="flex items-center text-sm">
                            <FaClock className="text-gray-400 mr-2" />
                            <span>{hearing.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <FaMapMarkerAlt className="text-gray-400 mr-2" />
                            <span>{hearing.location}</span>
                          </div>
                          {hearing.parties.length > 0 && (
                            <div className="flex items-start text-sm">
                              <FaUserTie className="text-gray-400 mr-2 mt-1" />
                              <div>
                                <span className="font-medium">Parties: </span>
                                {hearing.parties.join(", ")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Hearings Sidebar */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Upcoming Hearings</h2>
                <Link
                  to="/judge/hearings"
                  className="text-green-600 text-sm hover:underline"
                >
                  View All
                </Link>
              </div>

              {hearings.filter((h) => h.status === "Upcoming").length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No upcoming hearings scheduled.
                </p>
              ) : (
                <div className="space-y-4">
                  {hearings
                    .filter((h) => h.status === "Upcoming")
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5)
                    .map((hearing) => (
                      <div
                        key={hearing.id}
                        className="border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <Link
                          to={`/judge/hearings/${hearing.id}`}
                          className="hover:text-green-600"
                        >
                          <h3 className="font-medium">{hearing.caseTitle}</h3>
                        </Link>
                        <p className="text-gray-500 text-xs mb-2">
                          {hearing.caseNumber}
                        </p>
                        <div className="flex items-center text-sm">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <span>
                            {new Date(hearing.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          <FaClock className="text-gray-400 mr-2" />
                          <span>{hearing.time}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => openScheduleModal()}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Schedule New Hearing
                </button>
                <Link
                  to="/judge/hearings"
                  className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Manage All Hearings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Hearing Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold mb-4">
                Schedule New Hearing
              </h2>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Case *
                </label>
                <select
                  value={selectedCase?.id || ""}
                  onChange={handleCaseSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">-- Select a case --</option>
                  {availableCases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.caseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newHearing.date}
                    onChange={(e) =>
                      setNewHearing({ ...newHearing, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newHearing.time}
                    onChange={(e) =>
                      setNewHearing({ ...newHearing, time: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Courtroom 302"
                  value={newHearing.location}
                  onChange={(e) =>
                    setNewHearing({ ...newHearing, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Parties
                </label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Add party name"
                    value={partyInput}
                    onChange={(e) => setPartyInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <button
                    onClick={handleAddParty}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                {newHearing.parties.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newHearing.parties.map((party, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm"
                      >
                        <span>{party}</span>
                        <button
                          onClick={() => handleRemoveParty(index)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Add any notes about this hearing"
                  value={newHearing.notes}
                  onChange={(e) =>
                    setNewHearing({ ...newHearing, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleHearing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Schedule Hearing
                </button>
              </div>
            </div>
          </div>
        )}
      </JudgeLayout>
    </section>
  );
};

export default JudgeCalendar;
