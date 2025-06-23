/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { AdminPageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
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
  const [selectedCourtroom, setSelectedCourtroom] = useState(null);

  // Form states
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    courtroom: "",
    type: "Hearing",
  });

  const [newCourtroom, setNewCourtroom] = useState({
    name: "",
    location: "",
    capacity: 50,
  });

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
  const handleAddEvent = () => {
    if (
      !newEvent.title ||
      !newEvent.date ||
      !newEvent.startTime ||
      !newEvent.courtroom
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Check for time conflicts in the same courtroom
    const conflictingEvent = events.find(
      (event) =>
        event.date === newEvent.date &&
        event.courtroom === newEvent.courtroom &&
        event.startTime === newEvent.startTime
    );

    if (conflictingEvent) {
      alert(
        `Time conflict detected! ${newEvent.courtroom} is already booked at ${newEvent.startTime} on ${newEvent.date}`
      );
      return;
    }

    const eventToAdd = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      ...newEvent,
    };

    setEvents([...events, eventToAdd]);
    setShowAddEventModal(false);
    setNewEvent({
      title: "",
      date: selectedDate,
      startTime: "",
      endTime: "",
      courtroom: "",
      type: "Hearing",
    });

    alert("Event added successfully!");
  };

  // Handle adding a new courtroom
  const handleAddCourtroom = async () => {
    if (!newCourtroom.name || !newCourtroom.location) {
      alert("Please fill in all required fields");
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

      alert("Courtroom created successfully!");
    } catch (error) {
      console.error("Error creating courtroom:", error);
      alert("Failed to create courtroom. Please try again.");
    }
  };

  // Handle editing a courtroom
  const handleEditCourtroom = () => {
    if (!selectedCourtroom.name || !selectedCourtroom.location) {
      alert("Please fill in all required fields");
      return;
    }

    const updatedCourtrooms = courtrooms.map((courtroom) =>
      courtroom.id === selectedCourtroom.id ? selectedCourtroom : courtroom
    );

    setCourtrooms(updatedCourtrooms);
    setShowEditCourtroomModal(false);
    setSelectedCourtroom(null);
  };

  // Handle deleting a courtroom
  const handleDeleteCourtroom = (id) => {
    if (window.confirm("Are you sure you want to delete this courtroom?")) {
      // Check if courtroom is in use by any events
      const isInUse = events.some((event) => {
        const courtroom = courtrooms.find((c) => c.id === id);
        return event.courtroom === courtroom.name;
      });

      if (isInUse) {
        alert(
          "Cannot delete courtroom as it is being used by scheduled events"
        );
        return;
      }

      setCourtrooms(courtrooms.filter((courtroom) => courtroom.id !== id));
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
      ...newEvent,
      date: selectedDate,
    });
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
                            onClick={() => handleDeleteCourtroom(courtroom.id)}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Event</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title*
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time*
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      placeholder="e.g. 9:00AM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      placeholder="e.g. 10:30AM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Courtroom*
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newEvent.courtroom}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, courtroom: e.target.value })
                    }
                  >
                    <option value="">Select a courtroom</option>
                    {courtrooms.map((courtroom) => (
                      <option key={courtroom.id} value={courtroom.name}>
                        {courtroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newEvent.type}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, type: e.target.value })
                    }
                  >
                    <option value="Hearing">Hearing</option>
                    <option value="Trial">Trial</option>
                    <option value="Conference">Conference</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 rounded-md bg-tertiary text-white hover:bg-green-700 ease-in-out duration-300"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
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
      </AdminLayout>
    </section>
  );
};

export default AdminCalendar;
