/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientLayout from "../../components/ClientLayout";
import { FaExclamationTriangle, FaGavel, FaUserTie } from "react-icons/fa";

const NewCaseLegalDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(3);

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
      // Phase 1 - Essential Fields
      priority: "Medium",
      urgencyReason: "",
      representation: {
        hasLawyer: false,
        lawyerName: "",
        lawyerBarNumber: "",
        lawyerContact: {
          email: "",
          phone: "",
          address: "",
        },
        selfRepresented: true,
      },
      reliefSought: {
        monetaryDamages: false,
        injunctiveRelief: false,
        declaratoryJudgment: false,
        specificPerformance: false,
        other: "",
        detailedRequest: "",
      },
    }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if no form data
  useEffect(() => {
    if (!location.state?.formData) {
      navigate("/client/newcase");
    }
  }, [location.state, navigate]);

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
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    // Apply Ethiopian phone formatting for lawyer phone
    if (name === "representation.lawyerContact.phone") {
      processedValue = formatEthiopianPhone(value);
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "representation" && child === "hasLawyer") {
        setFormData((prev) => ({
          ...prev,
          representation: {
            ...prev.representation,
            hasLawyer: checked,
            selfRepresented: !checked,
          },
        }));
      } else if (name.includes("lawyerContact.")) {
        const [, , grandchild] = name.split(".");
        setFormData((prev) => ({
          ...prev,
          representation: {
            ...prev.representation,
            lawyerContact: {
              ...prev.representation.lawyerContact,
              [grandchild]: processedValue,
            },
          },
        }));
      } else if (parent === "representation") {
        setFormData((prev) => ({
          ...prev,
          representation: {
            ...prev.representation,
            [child]: processedValue,
          },
        }));
      } else if (parent === "reliefSought") {
        setFormData((prev) => ({
          ...prev,
          reliefSought: {
            ...prev.reliefSought,
            [child]: type === "checkbox" ? checked : processedValue,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.priority === "Urgent" && !formData.urgencyReason?.trim()) {
      newErrors.urgencyReason = "Please explain why this case is urgent";
    }

    if (formData.representation?.hasLawyer) {
      if (!formData.representation?.lawyerName?.trim()) {
        newErrors["representation.lawyerName"] = "Lawyer name is required";
      }
      if (!formData.representation?.lawyerBarNumber?.trim()) {
        newErrors["representation.lawyerBarNumber"] =
          "Lawyer Bar Number is required";
      }
      if (!formData.representation?.lawyerContact.phone?.trim()) {
        newErrors["representation.lawyerContact.phone"] =
          "Lawyer Phone Number is Required";
      } else {
        // Ethiopian phone number validation for lawyer
        const cleanPhone = formData.representation.lawyerContact.phone.replace(
          /[\s\-()]/g,
          ""
        );
        const ethiopianPhoneRegex = /^(\+251|0)?[9][0-9]{8}$/;

        if (!ethiopianPhoneRegex.test(cleanPhone)) {
          newErrors["representation.lawyerContact.phone"] =
            "Please enter a valid Ethiopian phone number (e.g., +251-9XX-XXX-XXX or 09XX-XXX-XXX)";
        }
      }
    }

    if (!formData.reliefSought?.detailedRequest?.trim()) {
      newErrors["reliefSought.detailedRequest"] =
        "Please describe what relief you are seeking";
    }

    return newErrors;
  };

  const handleBack = () => {
    navigate("/client/newcase/parties", { state: { formData } });
  };

  const handleContinue = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Navigate to the next step (documents)
    navigate("/client/newcase/documents", { state: { formData } });
  };

  return (
    <ClientLayout>
      <div className="mx-4 md:mx-7 my-2 mb-4 md:mb-6">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">
          File a New Case
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Submit a new legal matter to the court system.
        </p>
      </div>

      {/* Step Navigation - Desktop */}
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
          <span className="font-medium">Legal Details</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-tertiary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mx-4 md:mx-7">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
          Legal Details
        </h2>
        <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
          Provide additional legal information for your case
        </p>

        <form onSubmit={handleContinue}>
          {/* Case Priority */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              <FaExclamationTriangle className="inline mr-2 text-orange-500" />
              Case Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full text-gray-500 px-4 pt-5 pb-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Urgency Reason */}
          {formData.priority === "Urgent" && (
            <div className="relative mb-6">
              <textarea
                name="urgencyReason"
                value={formData.urgencyReason}
                onChange={handleChange}
                rows="3"
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                  errors.urgencyReason
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-tertiary"
                }`}
              />
              <label
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.urgencyReason
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Reason for Urgency *
              </label>
              {errors.urgencyReason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.urgencyReason}
                </p>
              )}
            </div>
          )}

          {/* Legal Representation */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-4">
              <FaUserTie className="inline mr-2 text-blue-500" />
              Legal Representation
            </label>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasLawyer"
                  name="representation.hasLawyer"
                  checked={formData.representation?.hasLawyer || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="hasLawyer" className="text-gray-700">
                  I have legal representation (lawyer/attorney)
                </label>
              </div>

              {formData.representation?.hasLawyer && (
                <div className="ml-6 space-y-4 p-4 shadow-md rounded-md">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      name="representation.lawyerName"
                      value={formData.representation?.lawyerName || ""}
                      onChange={handleChange}
                      className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                        errors["representation.lawyerName"]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-tertiary"
                      }`}
                    />
                    <label
                      className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                        formData.representation?.lawyerName
                          ? " text-base -top-2.5 bg-white px-1"
                          : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                      }`}
                    >
                      Lawyer Name *
                    </label>
                    {errors["representation.lawyerName"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["representation.lawyerName"]}
                      </p>
                    )}
                  </div>

                  <div className="relative mb-6">
                    <input
                      type="text"
                      name="representation.lawyerBarNumber"
                      value={formData.representation?.lawyerBarNumber || ""}
                      onChange={handleChange}
                      className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                        errors["representation.lawyerBarNumber"]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-tertiary"
                      }`}
                    />
                    <label
                      className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                        formData.representation?.lawyerBarNumber
                          ? " text-base -top-2.5 bg-white px-1"
                          : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                      }`}
                    >
                      Bar Number *
                    </label>
                    {errors["representation.lawyerBarNumber"] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors["representation.lawyerBarNumber"]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative mb-6">
                      <input
                        type="email"
                        name="representation.lawyerContact.email"
                        value={
                          formData.representation?.lawyerContact?.email || ""
                        }
                        onChange={handleChange}
                        className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary`}
                      />
                      <label className="absolute left-5 text-gray-500 duration-200 transition-all top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary">
                        Lawyer Email
                      </label>
                    </div>

                    <div className="relative mb-6">
                      <input
                        type="tel"
                        name="representation.lawyerContact.phone"
                        value={
                          formData.representation?.lawyerContact?.phone || ""
                        }
                        onChange={handleChange}
                        // placeholder="e.g., +251-912-345-678 or 0912-345-678"
                        className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                          errors["representation.lawyerContact.phone"]
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <label
                        className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                          formData.representation?.lawyerContact?.phone
                            ? " text-base -top-2.5 bg-white px-1"
                            : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                        }`}
                      >
                        Lawyer Phone (Ethiopian) *
                      </label>
                      {errors["representation.lawyerContact.phone"] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors["representation.lawyerContact.phone"]}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">
                        Ethiopian format: +251-9XX-XXX-XXX or 09XX-XXX-XXX
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Relief Sought */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-4">
              <FaGavel className="inline mr-2 text-purple-500" />
              Relief Sought (What do you want the court to do?)
            </label>

            <div className="space-y-3 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="monetaryDamages"
                  name="reliefSought.monetaryDamages"
                  checked={formData.reliefSought?.monetaryDamages || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="monetaryDamages" className="text-gray-700">
                  Monetary Damages (Money compensation)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="injunctiveRelief"
                  name="reliefSought.injunctiveRelief"
                  checked={formData.reliefSought?.injunctiveRelief || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="injunctiveRelief" className="text-gray-700">
                  Injunctive Relief (Stop someone from doing something)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="declaratoryJudgment"
                  name="reliefSought.declaratoryJudgment"
                  checked={formData.reliefSought?.declaratoryJudgment || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="declaratoryJudgment" className="text-gray-700">
                  Declaratory Judgment (Clarify legal rights)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="specificPerformance"
                  name="reliefSought.specificPerformance"
                  checked={formData.reliefSought?.specificPerformance || false}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="specificPerformance" className="text-gray-700">
                  Specific Performance (Force someone to do something)
                </label>
              </div>
            </div>

            <div className="relative mb-6 mt-10">
              <input
                type="text"
                name="reliefSought.other"
                value={formData.reliefSought?.other || ""}
                onChange={handleChange}
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary  `}
              />
              <label
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.reliefSought?.other
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Describe any other relief you're seeking
              </label>
            </div>

            <div className="relative mb-6">
              <textarea
                name="reliefSought.detailedRequest"
                value={formData.reliefSought?.detailedRequest || ""}
                onChange={handleChange}
                rows="4"
                className={`peer w-full border border-gray-300 rounded-lg px-6 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
                  errors["reliefSought.detailedRequest"]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-tertiary"
                }`}
              />
              <label
                className={`absolute left-5 text-gray-500 duration-200 transition-all ${
                  formData.reliefSought?.detailedRequest
                    ? " text-base -top-2.5 bg-white px-1"
                    : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                }`}
              >
                Provide a detailed description of what you want the court to
                order or decide... *
              </label>
              {errors["reliefSought.detailedRequest"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["reliefSought.detailedRequest"]}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 md:mt-8 flex flex-col md:flex-row justify-between gap-3 md:gap-0">
            <button
              type="button"
              onClick={handleBack}
              className="w-full md:w-auto px-5 py-3 bg-gray-200 text-gray-700 rounded-md hover:scale-95 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full md:w-auto px-5 py-3 bg-tertiary text-white rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300 text-sm md:text-base font-medium order-1 md:order-2"
            >
              Continue to Documents
            </button>
          </div>
        </form>
      </div>
    </ClientLayout>
  );
};

export default NewCaseLegalDetails;
