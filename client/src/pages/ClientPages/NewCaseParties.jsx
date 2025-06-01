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

    if (!formData.plaintiff.name.trim()) {
      newErrors["plaintiff.name"] = "Plaintiff name is required";
    }

    if (!formData.defendant.name.trim()) {
      newErrors["defendant.name"] = "Defendant name is required";
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

    // Navigate to the next step (documents)
    navigate("/client/newcase/legal-details", { state: { formData } });
  };

  return (
    <section>
      <ClientLayout>
        <div className="mx-7 my-4">
          <h1 className="text-xl font-semibold text-gray-800">
            File a New Case
          </h1>
          <p className="text-gray-600">
            Submit a new legal matter to the court system.
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
              Legal Details
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${
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

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 mx-7">
          {submitError && (
            <div
              className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Parties Involved
          </h2>
          <p className="text-gray-600 mb-6 font-light">
            Identify the individuals or entities involved in this case
          </p>

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

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-3 bg-tertiary text-white rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300"
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
