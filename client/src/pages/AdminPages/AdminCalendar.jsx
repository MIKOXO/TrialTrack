/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { AdminPageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import { FormLoadingOverlay } from "../../components/LoadingOverlay";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";
import { hearingsAPI, casesAPI, courtsAPI } from "../../services/api";

// Format date to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const AdminCalendar = () => {
  // State for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for events/hearings
  const [events, setEvents] = useState([]);

  // State for courtrooms
  const [courtrooms, setCourtrooms] = useState([]);

  // State for cases
  const [cases, setCases] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch hearings
        try {
          const hearingsResponse = await hearingsAPI.getHearings();
          const hearingsData = hearingsResponse.data;

          // Transform hearings for calendar display
          const transformedEvents = hearingsData.map((hearing) => ({
            id: hearing._id,
            title: `${hearing.case?.title || "Case"} - Hearing`,
            date: new Date(hearing.date).toISOString().split("T")[0],
            startTime: hearing.time,
            endTime: hearing.endTime || "TBD",
            courtroom: hearing.court?.name || "TBD",
            type: "Hearing",
          }));

          setEvents(transformedEvents);
        } catch (hearingError) {
          console.warn("Could not fetch hearings:", hearingError);
        }

        // Fetch courts
        try {
          const courtsResponse = await courtsAPI.getCourts();
          const courtsData = courtsResponse.data;

          // Transform courts for display
          const transformedCourtrooms = courtsData.map((court) => ({
            id: court._id,
            name: court.name,
            location: court.location,
            capacity: court.capacity || 50,
          }));

          setCourtrooms(transformedCourtrooms);
        } catch (courtError) {
          console.warn("Could not fetch courts:", courtError);
        }

        // Fetch cases
        try {
          const casesResponse = await casesAPI.getCases();
          const casesData = casesResponse.data;

          // Transform cases for display
          const transformedCases = casesData.map((caseItem) => ({
            id: caseItem._id,
            title: caseItem.title,
            caseNumber: caseItem.caseNumber,
            client: caseItem.client,
            status: caseItem.status,
          }));

          setCases(transformedCases);
        } catch (caseError) {
          console.warn("Could not fetch cases:", caseError);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Failed to load calendar data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modal states
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddCourtroomModal, setShowAddCourtroomModal] = useState(false);
  const [showEditCourtroomModal, setShowEditCourtroomModal] = useState(false);
  const [showDeleteCourtroomModal, setShowDeleteCourtroomModal] =
    useState(false);
  const [selectedCourtroom, setSelectedCourtroom] = useState(null);

  // Loading states
  const [addEventLoading, setAddEventLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [deleteCourtroomLoading, setDeleteCourtroomLoading] = useState(false);

  // Time checking states
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);

  // Form states
  const [newEvent, setNewEvent] = useState({
    date: "",
    startTime: "",
  });

  const [newCourtroom, setNewCourtroom] = useState({
    name: "",
    location: "",
    capacity: 50,
  });

  // Fetch available time slots when court or date changes
  useEffect(() => {
    if (selectedCourtId && newEvent.date) {
      fetchAvailableTimeSlots(selectedCourtId, newEvent.date);
    }
  }, [selectedCourtId, newEvent.date]);

  // Calendar navigation
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

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
        setError("Authentication token not found. Please sign in again.");
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

  // Format month and year for display
  function formatMonthYear(date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

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

    // Add empty cells for days after the last day of the month to complete the grid
    const remainingCells = 42 - calendar.length;
    for (let i = 0; i < remainingCells; i++) {
      calendar.push(null);
    }

    return calendar;
  };

  // Group events by date for easier rendering in calendar
  const groupEventsByDate = () => {
    const grouped = {};

    events.forEach((event) => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });

    return grouped;
  };

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (
      !selectedCase ||
      !newEvent.date ||
      !newEvent.startTime ||
      !selectedCourtId
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setAddEventLoading(true);

      // Get selected courtroom details
      const selectedCourtroom = courtrooms.find(
        (courtroom) => courtroom.id === selectedCourtId
      );

      // Check for time conflicts in the same courtroom
      const conflictingEvent = events.find(
        (event) =>
          event.date === newEvent.date &&
          event.courtroom === selectedCourtroom?.name &&
          event.startTime === newEvent.startTime
      );

      if (conflictingEvent) {
        setError(
          `Time conflict detected! ${selectedCourtroom?.name} is already booked at ${newEvent.startTime} on ${newEvent.date}`
        );
        return;
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const eventToAdd = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
        title: `${selectedCase?.title} - Hearing`, // Include case title
        date: newEvent.date,
        startTime: newEvent.startTime,
        endTime: "", // Default empty
        courtroom: selectedCourtroom?.name || "",
        type: "Hearing", // Default type
        caseId: selectedCase?.id,
        caseNumber: selectedCase?.caseNumber,
      };

      setEvents([...events, eventToAdd]);
      setShowAddEventModal(false);
      setNewEvent({
        date: selectedDate,
        startTime: "",
      });
      setSelectedCase(null);
      setSelectedCourtId("");
      setAvailableTimeSlots([]);

      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error("Error scheduling hearing:", error);
      setError(
        error.response?.data?.error ||
          "Failed to schedule hearing. Please try again."
      );
    } finally {
      setAddEventLoading(false);
    }
  };

  // Handle adding a new courtroom
  const handleAddCourtroom = async () => {
    if (!newCourtroom.name || !newCourtroom.location) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const response = await courtsAPI.createCourt(newCourtroom);
      const createdCourt = response.data;

      const courtroomToAdd = {
        id: createdCourt._id,
        name: createdCourt.name,
        location: createdCourt.location,
        capacity: createdCourt.capacity || 50,
      };

      setCourtrooms([...courtrooms, courtroomToAdd]);
      setShowAddCourtroomModal(false);
      setNewCourtroom({
        name: "",
        location: "",
        capacity: 50,
      });

      // Clear any previous errors
      setError(null);
    } catch (error) {
      console.error("Error creating courtroom:", error);
      setError(
        error.response?.data?.error ||
          "Failed to create courtroom. Please try again."
      );
    }
  };

  // Handle editing a courtroom
  const handleEditCourtroom = () => {
    if (!selectedCourtroom.name || !selectedCourtroom.location) {
      setError("Please fill in all required fields");
      return;
    }

    const updatedCourtrooms = courtrooms.map((courtroom) =>
      courtroom.id === selectedCourtroom.id ? selectedCourtroom : courtroom
    );

    setCourtrooms(updatedCourtrooms);
    setShowEditCourtroomModal(false);
    setSelectedCourtroom(null);
  };

  // Handle deleting a courtroom - open modal
  const handleDeleteCourtroom = (courtroom) => {
    setSelectedCourtroom(courtroom);
    setShowDeleteCourtroomModal(true);
  };

  // Confirm delete courtroom
  const confirmDeleteCourtroom = async () => {
    if (!selectedCourtroom) return;

    // Check if courtroom is in use by any events
    const isInUse = events.some((event) => {
      return event.courtroom === selectedCourtroom.name;
    });

    if (isInUse) {
      setError(
        "Cannot delete courtroom as it is being used by scheduled events"
      );
      setShowDeleteCourtroomModal(false);
      return;
    }

    try {
      setDeleteCourtroomLoading(true);

      // Call API to delete courtroom from database
      await courtsAPI.deleteCourt(selectedCourtroom.id);

      // Remove from local state only after successful deletion
      setCourtrooms(
        courtrooms.filter((courtroom) => courtroom.id !== selectedCourtroom.id)
      );

      // Close modal and reset state
      setShowDeleteCourtroomModal(false);
      setSelectedCourtroom(null);
      setError(null);
    } catch (error) {
      console.error("Error deleting courtroom:", error);
      setError(
        error.response?.data?.error ||
          "Failed to delete courtroom. Please try again."
      );
    } finally {
      setDeleteCourtroomLoading(false);
    }
  };

  // Open edit courtroom modal
  const openEditCourtroomModal = (courtroom) => {
    setSelectedCourtroom(courtroom);
    setShowEditCourtroomModal(true);
  };

  // Get events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    return events.filter((event) => event.date === selectedDate);
  };

  // Initialize new event with selected date when opening modal
  const openAddEventModal = () => {
    setNewEvent({
      date: selectedDate,
      startTime: "",
    });
    setSelectedCase(null);
    setSelectedCourtId("");
    setAvailableTimeSlots([]);
    setShowAddEventModal(true);
  };

  const calendarDays = generateCalendarDays();
  const eventsByDate = groupEventsByDate();
  const selectedDateEvents = getEventsForSelectedDate();

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageLoader message="Loading calendar..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <section>
      <AdminLayout>
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Court Calendar
          </h1>
          <p className="text-gray-600 font-light">
            Manage court schedules and events
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">
                  {formatMonthYear(currentMonth)}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaChevronLeft className="text-gray-600" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaChevronRight className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map(
                  (day, index) => (
                    <div
                      key={index}
                      className="text-center font-medium py-2 text-xs text-gray-500"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  const dateStr = day ? formatDate(day) : "";
                  const hasEvents = day && eventsByDate[dateStr];
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
                      onClick={() => day && setSelectedDate(formatDate(day))}
                    >
                      {day && (
                        <>
                          <div className="text-right text-sm mb-1">
                            {day.getDate()}
                          </div>
                          {hasEvents && (
                            <div>
                              {eventsByDate[dateStr]
                                .slice(0, 2)
                                .map((event) => (
                                  <div
                                    key={event.id}
                                    className={`text-xs p-1 mb-1 rounded truncate ${
                                      event.type === "Hearing"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                    title={event.title}
                                  >
                                    {event.startTime} - {event.title}
                                  </div>
                                ))}
                              {eventsByDate[dateStr].length > 2 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{eventsByDate[dateStr].length - 2} more
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

            {/* Upcoming Court Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Upcoming Court Events</h2>
              </div>

              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No upcoming events scheduled.
                </p>
              ) : (
                <div className="space-y-4">
                  {events
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex border-b pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="bg-gray-100 rounded-lg p-2 text-center mr-4 w-16">
                          <div className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </div>
                          <div className="text-lg font-bold">
                            {new Date(event.date).getDate()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FaClock className="mr-1 text-xs" />
                            <span>
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FaMapMarkerAlt className="mr-1 text-xs" />
                            <span>{event.courtroom}</span>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                event.type === "Hearing"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {event.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Events for Selected Date */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Events</h2>
              </div>

              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No Events scheduled yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FaClock className="mr-1 text-xs" />
                        <span>
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FaMapMarkerAlt className="mr-1 text-xs" />
                        <span>{event.courtroom}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={openAddEventModal}
                className="mt-4 w-full bg-tertiary text-white px-4 py-2 rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add Event
              </button>
            </div>

            {/* Courtrooms Management */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Courtrooms</h2>
                <button
                  onClick={() => setShowAddCourtroomModal(true)}
                  className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
                  title="Add Courtroom"
                >
                  <FaPlus />
                </button>
              </div>

              {courtrooms.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No courtrooms available.
                </p>
              ) : (
                <div className="space-y-3">
                  {courtrooms.map((courtroom) => (
                    <div key={courtroom.id} className="border rounded-lg p-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{courtroom.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditCourtroomModal(courtroom)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Courtroom"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteCourtroom(courtroom)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Courtroom"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {courtroom.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Capacity: {courtroom.capacity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddEventModal && (
          <FormLoadingOverlay
            isVisible={addEventLoading}
            message="Scheduling hearing..."
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Schedule Hearing
                  </h2>
                  <button
                    onClick={() => setShowAddEventModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case *
                  </label>
                  <select
                    value={selectedCase?.id || ""}
                    onChange={(e) => {
                      const caseId = e.target.value;
                      const caseItem = cases.find((c) => c.id === caseId);
                      setSelectedCase(caseItem || null);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">-- Select a case --</option>
                    {cases.map((caseItem) => (
                      <option key={caseItem.id} value={caseItem.id}>
                        {caseItem.title} (ID: {caseItem.caseNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                    {selectedCourtId && newEvent.date && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({availableTimeSlots.length} slots available)
                      </span>
                    )}
                  </label>
                  {selectedCourtId &&
                  newEvent.date &&
                  availableTimeSlots.length > 0 ? (
                    <select
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={loadingTimeSlots}
                    >
                      <option value="">-- Select available time --</option>
                      {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  ) : selectedCourtId &&
                    newEvent.date &&
                    availableTimeSlots.length === 0 &&
                    !loadingTimeSlots ? (
                    <div className="w-full border border-red-300 rounded-md px-3 py-2 bg-red-50 text-red-700 text-sm">
                      No available time slots for this date. Please choose a
                      different date or courtroom.
                    </div>
                  ) : (
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={
                        selectedCourtId && newEvent.date
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courtroom *
                  </label>
                  <select
                    value={selectedCourtId}
                    onChange={(e) => setSelectedCourtId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">-- Select a courtroom --</option>
                    {courtrooms.map((courtroom) => (
                      <option key={courtroom.id} value={courtroom.id}>
                        {courtroom.name} - {courtroom.location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddEventModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleAddEvent}
                    loading={addEventLoading}
                    loadingText="Scheduling..."
                    disabled={
                      !selectedCase ||
                      !newEvent.date ||
                      !newEvent.startTime ||
                      !selectedCourtId
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Schedule
                  </LoadingButton>
                </div>
              </div>
            </div>
          </FormLoadingOverlay>
        )}

        {/* Add Courtroom Modal */}
        {showAddCourtroomModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Courtroom</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courtroom Name*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newCourtroom.name}
                    onChange={(e) =>
                      setNewCourtroom({ ...newCourtroom, name: e.target.value })
                    }
                    placeholder="e.g. Courtroom 501"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newCourtroom.location}
                    onChange={(e) =>
                      setNewCourtroom({
                        ...newCourtroom,
                        location: e.target.value,
                      })
                    }
                    placeholder="e.g. 5th Floor, East Wing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newCourtroom.capacity}
                    onChange={(e) =>
                      setNewCourtroom({
                        ...newCourtroom,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddCourtroomModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCourtroom}
                  className="px-4 py-2 rounded-md bg-tertiary text-white hover:bg-green-700 ease-in-out duration-300"
                >
                  Add Courtroom
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Courtroom Modal */}
        {showEditCourtroomModal && selectedCourtroom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Courtroom</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courtroom Name*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedCourtroom.name}
                    onChange={(e) =>
                      setSelectedCourtroom({
                        ...selectedCourtroom,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedCourtroom.location}
                    onChange={(e) =>
                      setSelectedCourtroom({
                        ...selectedCourtroom,
                        location: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedCourtroom.capacity}
                    onChange={(e) =>
                      setSelectedCourtroom({
                        ...selectedCourtroom,
                        capacity: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditCourtroomModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCourtroom}
                  className="px-4 py-2 rounded-md bg-tertiary text-white hover:bg-green-700 ease-in-out duration-300"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Courtroom Confirmation Modal */}
        {showDeleteCourtroomModal && selectedCourtroom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-red-600">
                Delete Courtroom
              </h2>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this courtroom?
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {selectedCourtroom.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Location: {selectedCourtroom.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    Capacity: {selectedCourtroom.capacity} people
                  </p>
                </div>
                <p className="text-sm text-red-600 mt-3">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteCourtroomModal(false);
                    setSelectedCourtroom(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={deleteCourtroomLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCourtroom}
                  disabled={deleteCourtroomLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {deleteCourtroomLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {deleteCourtroomLoading
                      ? "Deleting..."
                      : "Delete Courtroom"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </section>
  );
};

export default AdminCalendar;
