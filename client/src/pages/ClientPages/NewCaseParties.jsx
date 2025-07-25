/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientLayout from "../../components/ClientLayout";

const NewCaseParties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(2);

  // Get form data from location state or initialize with defaults
  const [formData, setFormData] = useState(
    location.state?.formData || {
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
    }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Format Ethiopian phone number
  const formatEthiopianPhone = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Handle different input patterns
    if (digits.startsWith("251")) {
      // International format: +251-9XX-XXX-XXX
      const formatted = digits.replace(
        /^(251)([9])(\d{2})(\d{3})(\d{3})$/,
        "+$1-$2$3-$4-$5"
      );
      return formatted.length <= 17 ? formatted : value;
    } else if (digits.startsWith("09")) {
      // Local format: 09XX-XXX-XXX
      const formatted = digits.replace(
        /^(09)(\d{2})(\d{3})(\d{3})$/,
        "$1$2-$3-$4"
      );
      return formatted.length <= 13 ? formatted : value;
    } else if (digits.startsWith("9") && digits.length <= 9) {
      // Format as 9XX-XXX-XXX
      const formatted = digits.replace(
        /^(9)(\d{2})(\d{3})(\d{3})$/,
        "$1$2-$3-$4"
      );
      return formatted.length <= 11 ? formatted : value;
    }

    return digits.length <= 13 ? digits : value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Apply Ethiopian phone formatting for defendant phone
    if (name === "defendant.phone") {
      processedValue = formatEthiopianPhone(value);
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: processedValue,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: processedValue,
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

    if (!formData.plaintiff.name.trim()) {
      newErrors["plaintiff.name"] = "Plaintiff name is required";
    }

    if (!formData.defendant.name.trim()) {
      newErrors["defendant.name"] = "Defendant name is required";
    }

    if (!formData.defendant.phone.trim()) {
      newErrors["defendant.phone"] = "Defendant phone number is required";
    } else {
      // Ethiopian phone number validation
      const cleanPhone = formData.defendant.phone.replace(/[\s\-\(\)]/g, "");
      const ethiopianPhoneRegex = /^(\+251|0)?[9][0-9]{8}$/;

      if (!ethiopianPhoneRegex.test(cleanPhone)) {
        newErrors["defendant.phone"] =
          "Please enter a valid Ethiopian phone number (e.g., +251-9XX-XXX-XXX or 09XX-XXX-XXX)";
      }
    }

    // Email validation (optional but must be valid if provided)
    if (
      formData.defendant.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.defendant.email)
    ) {
      newErrors["defendant.email"] = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleBack = () => {
    navigate("/client/newcase", { state: { formData } });
  };

  const handleContinue = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Navigate to the next step (legal details)
    navigate("/client/newcase/legal-details", { state: { formData } });
  };

  return (
    <section>
      <ClientLayout>
        <div className="mx-4 md:mx-7 my-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">
            File a New Case
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Submit a new legal matter to the court system.
          </p>
        </div>

        {/* Pagination - Desktop */}
        <div className="hidden lg:block mx-4 md:mx-7 mb-6 bg-tertiary bg-opacity-15 rounded-md shadow-md">
          <div className="flex overflow-hidden p-2">
            <button
              className={`flex-1 py-5 px-4 text-center text-sm lg:text-base ${
                currentStep === 1
                  ? "bg-white rounded-lg text-green-600 font-medium"
                  : " border-transparent text-gray-500"
              }`}
            >
              Case Information
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center text-sm lg:text-base ${
                currentStep === 2
                  ? "bg-white rounded-lg text-green-600 font-medium"
                  : "border-transparent text-gray-500"
              }`}
              disabled={currentStep < 2}
            >
              Parties Involved
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center text-sm lg:text-base ${
                currentStep === 3
                  ? "bg-white rounded-lg text-green-600 font-medium"
                  : "border-transparent text-gray-500"
              }`}
              disabled={currentStep < 3}
            >
              Legal Details
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center text-sm lg:text-base ${
                currentStep === 4
                  ? "bg-white rounded-lg text-green-600 font-medium"
                  : "border-transparent text-gray-500"
              }`}
              disabled={currentStep < 4}
            >
              Documents and review
            </button>
          </div>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="lg:hidden mx-4 mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Step {currentStep} of 4</span>
            <span className="font-medium">Parties Involved</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-tertiary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6 mx-4 md:mx-7">
          {submitError && (
            <div
              className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
            Parties Involved
          </h2>
          <p className="text-gray-600 mb-4 md:mb-6 font-light text-sm md:text-base">
            Identify the individuals or entities involved in this case
          </p>

          <div className="bg-tertiary bg-opacity-15 rounded-lg border-l-4 border-green-400 p-3 md:p-4 mb-4 md:mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-tertiary">
                  <strong>Required Information:</strong> Fields marked with{" "}
                  <span className="text-red-500">*</span> are required. The
                  defendant's phone number is mandatory for court notifications
                  and service of process.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleContinue}>
            <div className="mb-6 relative">
              <input
                type="text"
                id="plaintiff.name"
                name="plaintiff.name"
                value={formData.plaintiff.name}
                onChange={handleChange}
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-tertiary"
                }`}
              />
              <label
                htmlFor="plaintiff.name"
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.plaintiff.name
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Name of Plaintiff
              </label>
              {errors["plaintiff.name"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["plaintiff.name"]}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                If you are representing yourself, enter your name here
              </p>
            </div>

            <div className="mb-6 relative">
              <input
                type="text"
                id="defendant.name"
                name="defendant.name"
                value={formData.defendant.name}
                onChange={handleChange}
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-tertiary"
                }`}
              />
              <label
                htmlFor="defendant.name"
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.defendant.name
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Name of Defendant
              </label>
              {errors["defendant.name"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["defendant.name"]}
                </p>
              )}
            </div>

            <div className="mb-6 relative">
              <input
                type="tel"
                id="defendant.phone"
                name="defendant.phone"
                value={formData.defendant.phone}
                onChange={handleChange}
                // placeholder="e.g., +251-912-345-678 or 0912-345-678"
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                  errors["defendant.phone"]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-tertiary"
                }`}
              />
              <label
                htmlFor="defendant.phone"
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.defendant.phone
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Defendant Phone Number (Ethiopian){" "}
                <span className="text-red-500">*</span>
              </label>
              {errors["defendant.phone"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["defendant.phone"]}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Ethiopian format: +251-9XX-XXX-XXX or 09XX-XXX-XXX. Required for
                court notifications.
              </p>
            </div>

            <div className="mb-6 relative">
              <input
                type="email"
                id="defendant.email"
                name="defendant.email"
                value={formData.defendant.email}
                onChange={handleChange}
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary  border-gray-300 `}
              />

              <label
                htmlFor="defendant.email"
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.defendant.phone
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Defendant Email Address{" "}
                <span className="text-gray-500">(Optional)</span>
              </label>
              {errors["defendant.email"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["defendant.email"]}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                If provided, will be used for electronic service of documents
              </p>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between gap-3 md:gap-0">
              <button
                type="button"
                onClick={handleBack}
                className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm md:text-base order-2 md:order-1"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-full md:w-auto px-5 py-3 bg-tertiary text-white rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300 text-sm md:text-base font-medium order-1 md:order-2"
              >
                Continue to documents
              </button>
            </div>
          </form>
        </div>
      </ClientLayout>
    </section>
  );
};

export default NewCaseParties;
