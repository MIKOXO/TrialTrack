import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import JudgeLayout from "../../components/JudgeLayout";
import { JudgePageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import { FormLoadingOverlay } from "../../components/LoadingOverlay";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { courtsAPI } from "../../services/api";
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
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newHearing, setNewHearing] = useState({
    caseTitle: "",
    caseNumber: "",
    date: "",
    time: "",
    selectedCourt: "",
    parties: [],
    notes: "",
    type: "Civil",
  });
  const [availableCases, setAvailableCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [partyInput, setPartyInput] = useState("");
  const [availableCourts, setAvailableCourts] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch assigned cases for the judge
        const casesResponse = await axios.get(
          "http://localhost:3001/api/case",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Transform cases data for the dropdown
        const transformedCases = casesResponse.data.map((caseItem) => ({
          id: caseItem._id,
          title: caseItem.title,
          caseNumber: caseItem._id.slice(-8).toUpperCase(),
          type: caseItem.caseType
            ? caseItem.caseType.charAt(0).toUpperCase() +
              caseItem.caseType.slice(1)
            : "General",
        }));

        setAvailableCases(transformedCases);

        // Fetch available courts
        const courtsResponse = await courtsAPI.getCourts();
        setAvailableCourts(courtsResponse.data);

        // Fetch hearings for the judge
        const hearingsResponse = await axios.get(
          "http://localhost:3001/api/hearings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Transform hearings data for the calendar
        const transformedHearings = hearingsResponse.data.map((hearing) => ({
          id: hearing._id,
          caseTitle: hearing.case?.title || "Unknown Case",
          caseNumber: hearing._id.slice(-8).toUpperCase(),
          caseId: hearing.case?._id || "",
          date: hearing.date.split("T")[0], // Convert to YYYY-MM-DD format
          time: hearing.time,
          location: hearing.court?.name || "TBD",
          status:
            new Date(hearing.date) > new Date() ? "Upcoming" : "Completed",
          parties: [], // Backend doesn't store parties separately
          notes: hearing.notes || "",
          type: hearing.case?.caseType
            ? hearing.case.caseType === "smallClaims"
              ? "SmallClaims"
              : hearing.case.caseType.charAt(0).toUpperCase() +
                hearing.case.caseType.slice(1)
            : "General",
        }));

        setHearings(transformedHearings);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Failed to load calendar data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available time slots for selected court and date
  const fetchAvailableTimeSlots = async (courtId, date) => {
    if (!courtId || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    try {
      setLoadingTimeSlots(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      const response = await axios.get(
        `http://localhost:3001/api/hearings/available-slots/${courtId}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAvailableTimeSlots(response.data.availableSlots);
    } catch (err) {
      console.error("Error fetching available time slots:", err);
      setAvailableTimeSlots([]);
      // Don't show error for this as it's not critical
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Fetch available time slots when court or date changes
  useEffect(() => {
    if (newHearing.selectedCourt && newHearing.date) {
      fetchAvailableTimeSlots(newHearing.selectedCourt, newHearing.date);
    }
  }, [newHearing.selectedCourt, newHearing.date]);

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

  const handleDeleteHearing = async (hearingId) => {
    if (window.confirm("Are you sure you want to delete this hearing?")) {
      try {
        setDeleteLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          showError("Authentication token not found. Please sign in again.");
          return;
        }

        await axios.delete(`http://localhost:3001/api/hearings/${hearingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove from local state
        setHearings(hearings.filter((hearing) => hearing.id !== hearingId));
        setActionMenuOpen(null);
        showSuccess("Hearing deleted successfully!");
      } catch (err) {
        console.error("Error deleting hearing:", err);
        showError(
          err.response?.data?.error ||
            "Failed to delete hearing. Please try again."
        );
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const openScheduleModal = (date) => {
    setNewHearing({
      ...newHearing,
      date: date || formatDate(new Date()),
      time: "",
      selectedCourt: "",
    });
    setSelectedCase(null);
    setAvailableTimeSlots([]);
    setShowScheduleModal(true);
  };

  const handleCaseSelect = (e) => {
    const caseId = e.target.value;
    const selectedCase = availableCases.find((c) => c.id === caseId);

    if (selectedCase) {
      // Check if case is closed
      if (selectedCase.status === "Closed") {
        showError(
          "Cannot schedule hearing for closed case. Only open or in-progress cases can have hearings scheduled."
        );
        return;
      }

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

  const handleScheduleHearing = async () => {
    if (
      !selectedCase ||
      !newHearing.date ||
      !newHearing.time ||
      !newHearing.selectedCourt
    ) {
      showError("Please fill in all required fields");
      return;
    }

    try {
      setScheduleLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      // Find the selected court details
      const selectedCourtData = availableCourts.find(
        (court) => court._id === newHearing.selectedCourt
      );

      const hearingData = {
        date: newHearing.date,
        time: newHearing.time,
        notes: newHearing.notes,
        courtId: newHearing.selectedCourt,
      };

      const response = await axios.post(
        `http://localhost:3001/api/hearings/create/${selectedCase.id}`,
        hearingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        // Add the new hearing to the local state
        const newHearingObj = {
          id: response.data._id,
          caseTitle: selectedCase.title,
          caseNumber: selectedCase.caseNumber,
          caseId: selectedCase.id,
          date: newHearing.date,
          time: newHearing.time,
          location: selectedCourtData?.name || "Selected Court",
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
          selectedCourt: "",
          parties: [],
          notes: "",
          type: "Civil",
        });
        setSelectedCase(null);
        setAvailableTimeSlots([]);
        showSuccess(
          `Hearing successfully scheduled for "${
            selectedCase.title
          }" on ${new Date(newHearing.date).toLocaleDateString()} at ${
            newHearing.time
          } in ${selectedCourtData?.name || "Selected Court"}`,
          6000 // Show for 6 seconds since it's a longer message
        );
      }
    } catch (err) {
      console.error("Error scheduling hearing:", err);

      // Handle specific error types
      if (err.response?.status === 409) {
        showError(
          err.response.data.details ||
            err.response.data.error ||
            "Scheduling conflict detected. Please choose a different time or courtroom.",
          8000 // Show longer for conflict messages
        );
      } else if (
        err.response?.status === 400 &&
        err.response.data.error?.includes("closed case")
      ) {
        showError(
          err.response.data.details ||
            err.response.data.error ||
            "Cannot schedule hearing for closed case. Only open or in-progress cases can have hearings scheduled.",
          6000
        );
      } else {
        showError(
          err.response?.data?.error ||
            "Failed to schedule hearing. Please try again."
        );
      }
    } finally {
      setScheduleLoading(false);
    }
  };

  // Get hearings for selected date
  const getHearingsForSelectedDate = () => {
    if (!selectedDate) return [];
    return hearings.filter((hearing) => hearing.date === selectedDate);
  };

  const calendarDays = generateCalendarDays();
  const hearingsByDate = groupHearingsByDate();
  const selectedDateHearings = getHearingsForSelectedDate();

  if (loading) {
    return (
      <JudgeLayout>
        <JudgePageLoader message="Loading calendar..." />
      </JudgeLayout>
    );
  }

  if (error) {
    return (
      <JudgeLayout>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-3 rounded relative mx-4 md:mx-0"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </JudgeLayout>
    );
  }

  return (
    <section>
      <JudgeLayout>
        <div className="mb-4 md:mb-6 px-4 md:px-0">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            Calendar
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            View and manage your court hearings schedule
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={previousMonth}
                  className="px-2 md:px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm md:text-base"
                >
                  <span className="hidden sm:inline">&lt; Previous</span>
                  <span className="sm:hidden">&lt;</span>
                </button>
                <h2 className="text-base md:text-lg font-medium text-center">
                  {formatMonthYear(currentMonth)}
                </h2>
                <button
                  onClick={nextMonth}
                  className="px-2 md:px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm md:text-base"
                >
                  <span className="hidden sm:inline">Next &gt;</span>
                  <span className="sm:hidden">&gt;</span>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <div
                      key={index}
                      className="text-center font-medium py-1 md:py-2 text-gray-600 text-xs md:text-sm"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.charAt(0)}</span>
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
                      className={`border p-0.5 md:p-1 min-h-[60px] md:min-h-[80px] ${
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
                              className={`text-xs md:text-sm ${
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
                                className="text-green-600 hover:text-green-700 text-xs p-1"
                                title="Schedule hearing"
                              >
                                <FaPlus />
                              </button>
                            )}
                          </div>
                          {hasHearings && (
                            <div className="space-y-0.5">
                              {hearingsByDate[dateStr]
                                .slice(0, 2)
                                .map((hearing) => (
                                  <div
                                    key={hearing.id}
                                    className="text-xs p-0.5 md:p-1 mb-0.5 md:mb-1 rounded bg-green-100 text-green-800 truncate"
                                    title={hearing.caseTitle}
                                  >
                                    <span className="hidden sm:inline">
                                      {hearing.time} -{" "}
                                    </span>
                                    <span className="truncate">
                                      {hearing.caseTitle}
                                    </span>
                                  </div>
                                ))}
                              {hearingsByDate[dateStr].length > 2 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{hearingsByDate[dateStr].length - 2} more
                                </div>
                              )}
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
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
                  <h2 className="text-base md:text-lg font-medium">
                    <span className="hidden sm:inline">Hearings for </span>
                    <span className="sm:hidden">Hearings - </span>
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </h2>
                  <button
                    onClick={() => openScheduleModal(selectedDate)}
                    className="w-full sm:w-auto bg-tertiary text-white px-3 py-1 rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center text-xs md:text-sm"
                  >
                    <FaPlus className="mr-1" />
                    <span className="hidden sm:inline">Schedule Hearing</span>
                    <span className="sm:hidden">Schedule</span>
                  </button>
                </div>

                {selectedDateHearings.length === 0 ? (
                  <p className="text-gray-500 text-center py-3 md:py-4 text-sm md:text-base">
                    No hearings scheduled for this date.
                  </p>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {selectedDateHearings.map((hearing) => (
                      <div
                        key={hearing.id}
                        className="border-b pb-3 md:pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-base md:text-lg break-words">
                              {hearing.caseTitle}
                            </h3>
                            <p className="text-gray-500 text-xs md:text-sm mb-2 break-words">
                              Case #{hearing.caseNumber}
                            </p>
                          </div>
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={() => handleActionClick(hearing.id)}
                              className="text-gray-400 hover:text-gray-600 p-2"
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
                          <div className="flex items-center text-xs md:text-sm">
                            <FaClock className="text-gray-400 mr-2 flex-shrink-0" />
                            <span>{hearing.time}</span>
                          </div>
                          <div className="flex items-center text-xs md:text-sm">
                            <FaMapMarkerAlt className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="break-words">
                              {hearing.location}
                            </span>
                          </div>
                          {hearing.parties.length > 0 && (
                            <div className="flex items-start text-xs md:text-sm">
                              <FaUserTie className="text-gray-400 mr-2 mt-1 flex-shrink-0" />
                              <div className="min-w-0">
                                <span className="font-medium">Parties: </span>
                                <span className="break-words">
                                  {hearing.parties.join(", ")}
                                </span>
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
          <div className="space-y-4 md:space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
                <h2 className="text-base md:text-lg font-medium">
                  Upcoming Hearings
                </h2>
                <Link
                  to="/judge/hearings"
                  className="text-tertiary text-xs md:text-sm hover:underline self-start sm:self-auto"
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

            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => openScheduleModal()}
                  className="w-full bg-tertiary text-white px-4 py-2 rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center"
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
          <FormLoadingOverlay
            isVisible={scheduleLoading}
            message="Scheduling hearing..."
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl mx-auto my-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Schedule Hearing
                  </h2>
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setAvailableTimeSlots([]);
                      setSelectedCase(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Case *
                  </label>
                  <select
                    value={selectedCase?.id || ""}
                    onChange={handleCaseSelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                  >
                    <option value="">-- Select a case --</option>
                    {availableCases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.caseNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCase && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">Case:</p>
                    <p className="font-medium text-gray-900">
                      {selectedCase.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {selectedCase.caseNumber}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Time *
                      {newHearing.selectedCourt && newHearing.date && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({availableTimeSlots.length} slots available)
                        </span>
                      )}
                    </label>
                    {newHearing.selectedCourt &&
                    newHearing.date &&
                    availableTimeSlots.length > 0 ? (
                      <select
                        value={newHearing.time}
                        onChange={(e) =>
                          setNewHearing({ ...newHearing, time: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                        disabled={loadingTimeSlots}
                      >
                        <option value="">-- Select available time --</option>
                        {availableTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    ) : newHearing.selectedCourt &&
                      newHearing.date &&
                      availableTimeSlots.length === 0 &&
                      !loadingTimeSlots ? (
                      <div className="w-full border border-red-300 rounded-md px-3 py-2 bg-red-50 text-red-700 text-sm">
                        No available time slots for this date. Please choose a
                        different date or courtroom.
                      </div>
                    ) : (
                      <input
                        type="time"
                        value={newHearing.time}
                        onChange={(e) =>
                          setNewHearing({ ...newHearing, time: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                        placeholder={
                          newHearing.selectedCourt && newHearing.date
                            ? "Loading available times..."
                            : "Select court and date first"
                        }
                        disabled={loadingTimeSlots}
                      />
                    )}
                    {loadingTimeSlots && (
                      <div className="text-xs text-gray-500 mt-1">
                        Loading available time slots...
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Courtroom *
                  </label>
                  <select
                    value={newHearing.selectedCourt}
                    onChange={(e) =>
                      setNewHearing({
                        ...newHearing,
                        selectedCourt: e.target.value,
                        time: "",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                  >
                    <option value="">-- Select a courtroom --</option>
                    {availableCourts.map((court) => (
                      <option key={court._id} value={court._id}>
                        {court.name} - {court.location} ({court.type})
                      </option>
                    ))}
                  </select>
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                    />
                    <button
                      onClick={handleAddParty}
                      className="px-4 py-2 bg-tertiary text-white rounded-r-md hover:bg-green-700 ease-in-out duration-300"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setShowScheduleModal(false);
                      setAvailableTimeSlots([]);
                      setSelectedCase(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ease-in-out duration-300"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleScheduleHearing}
                    loading={scheduleLoading}
                    loadingText="Scheduling..."
                    disabled={
                      !selectedCase ||
                      !newHearing.date ||
                      !newHearing.time ||
                      !newHearing.selectedCourt
                    }
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Schedule
                  </LoadingButton>
                </div>
              </div>
            </div>
          </FormLoadingOverlay>
        )}
      </JudgeLayout>

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position="sidebar-layout-top-right"
      />
    </section>
  );
};

export default JudgeCalendar;
