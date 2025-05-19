/* eslint-disable no-unused-vars */
import { useState } from "react";
import ClientLayout from "../../components/ClientLayout";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt } from "react-icons/fa";

const NewCase = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    caseType: "",
    court: "",
    reportDate: "",
    description: "",
    plaintiff: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    defendant: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    evidence: "",
  });

  const caseTypes = [
    { value: "", label: "Select case type" },
    { value: "civil", label: "Civil Case" },
    { value: "criminal", label: "Criminal Case" },
    { value: "family", label: "Family Law" },
    { value: "traffic", label: "Traffic Violation" },
    { value: "smallClaims", label: "Small Claims" },
    { value: "other", label: "Other" },
  ];

  const courts = [
    { value: "", label: "Select Court" },
    { value: "district", label: "District Court" },
    { value: "high", label: "High Court" },
    { value: "supreme", label: "Supreme Court" },
    { value: "family", label: "Family Court" },
    { value: "traffic", label: "Traffic Court" },
  ];
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Case title is required";
    }

    if (!formData.caseType) {
      newErrors.caseType = "Please select a case type";
    }

    if (!formData.court) {
      newErrors.court = "Please select a court";
    }

    if (!formData.reportDate) {
      newErrors.reportDate = "Report date is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Case description is required";
    }

    return newErrors;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Navigate to the parties involved step with the current form data
    navigate("/client/newcase/parties", { state: { formData } });
  };

  return (
    <section>
      <ClientLayout>
        <div className="px-7 py-4 font-Lexend">
          <h1 className="text-2xl font-medium">File a New Case</h1>
          <p className="font-light text-lg mt-1">
            Submit a new legal matter to the court system
          </p>
        </div>

        {/* Pagination */}
        <div className="mx-7 mb-6 bg-tertiary bg-opacity-15 rounded-md shadow-md">
          <div className="flex overflow-hidden p-2">
            <button
              className={`flex-1 py-5 px-4 text-center ${
                currentStep === 1
                  ? "bg-white rounded-lg text-green-600 font-medium"
                  : " border-transparent text-gray-500"
              }`}
            >
              Case Information
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${
                currentStep === 2
                  ? "bg-white rounded-lg text-green-600 font-medium"
                  : "border-transparent text-gray-500"
              }`}
              disabled={currentStep < 2}
            >
              Parties Involved
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${
                currentStep === 3
                  ? "bg-white rounded-lg text-green-600 font-medium"
                  : "border-transparent text-gray-500"
              }`}
              disabled={currentStep < 3}
            >
              Documents and review
            </button>
          </div>
        </div>

        <div className="mx-7 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Case Information
          </h2>
          <p className="text-gray-600 mb-6 font-light">
            Enter the basic details about your legal matter
          </p>

          <form onSubmit={handleContinue}>
            <div className="mb-4 relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-tertiary"
                }`}
              />
              <label
                htmlFor="title"
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.title
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Case Title
              </label>
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="">
                <select
                  style={{ appearance: "none" }}
                  id="caseType"
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  className={`peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                    errors.caseType
                      ? " border-red-500 focus:ring-red-500"
                      : "text-gray-500 border-gray-300 focus:ring-tertiary"
                  }`}
                >
                  {caseTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.caseType && (
                  <p className="text-red-500 text-sm mt-1">{errors.caseType}</p>
                )}
              </div>

              <div>
                <select
                  style={{ appearance: "none" }}
                  id="court"
                  name="court"
                  value={formData.court}
                  onChange={handleChange}
                  className={`peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                    errors.court
                      ? "border-red-500 focus:ring-red-500"
                      : "text-gray-500 border-gray-300 focus:ring-tertiary"
                  }`}
                >
                  {courts.map((court) => (
                    <option key={court.value} value={court.value}>
                      {court.label}
                    </option>
                  ))}
                </select>
                {errors.court && (
                  <p className="text-red-500 text-sm mt-1">{errors.court}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="date"
                  id="reportDate"
                  name="reportDate"
                  value={formData.reportDate}
                  onChange={handleChange}
                  className={`peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                    errors.reportDate
                      ? "border-red-500 focus:ring-red-500"
                      : "text-gray-500 border-gray-300 focus:ring-tertiary"
                  }`}
                />

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
              </div>
              {errors.reportDate && (
                <p className="text-red-500 text-sm mt-1">{errors.reportDate}</p>
              )}
            </div>

            <div className="mb-4 relative">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`peer w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-tertiary"
                }`}
              ></textarea>
              <label
                htmlFor="description"
                className={`absolute left-4 text-gray-500 duration-200 transition-all ${
                  formData.description
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Case Description
              </label>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-5 py-3 bg-tertiary text-white rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300"
              >
                Continue to parties
              </button>
            </div>
          </form>
        </div>
      </ClientLayout>
    </section>
  );
};

export default NewCase;
