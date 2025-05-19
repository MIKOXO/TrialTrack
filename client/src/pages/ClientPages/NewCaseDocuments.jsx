/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientLayout from "../../components/ClientLayout";
import { FaUpload, FaFile, FaTrash } from "react-icons/fa";

const NewCaseDocuments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(3);

  // Get form data from location state or redirect to first step
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
      documents: [],
    }
  );

  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Redirect if no form data
  useEffect(() => {
    if (!location.state?.formData) {
      navigate("/client/newcase");
    }
  }, [location.state, navigate]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Create document objects with preview URLs
    const newDocuments = files.map((file) => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      preview: URL.createObjectURL(file),
    }));

    setDocuments([...documents, ...newDocuments]);
  };

  const removeDocument = (id) => {
    const updatedDocuments = documents.filter((doc) => doc.id !== id);
    setDocuments(updatedDocuments);
  };

  const handleBack = () => {
    navigate("/client/newcase/parties", {
      state: { formData: { ...formData, documents } },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // In a real application, we would post to the API
      // For now, we'll just simulate a successful submission

      setTimeout(() => {
        setLoading(false);
        setSubmitSuccess(true);

        // Redirect after a delay
        setTimeout(() => {
          navigate("/client/mycases");
        }, 2000);
      }, 1500);
    } catch (err) {
      console.error("Error filing case:", err);
      setSubmitError(
        err.response?.data?.error || "Failed to file case. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <section>
      <ClientLayout>
        <div className="my-4 mx-7">
          <h1 className="text-xl font-semibold text-gray-800">
            File a New Case
          </h1>
          <p className="text-gray-600 font-light">
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
              Documents and review
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mx-7">
          {submitError && (
            <div
              className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div
              className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">
                Case filed successfully! Redirecting to your cases...
              </span>
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Documents and Review
          </h2>
          <p className="text-gray-600 mb-6">
            Upload supporting documents and review your case details
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Upload Documents (Optional)
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="documents"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="documents"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <FaUpload className="text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-700 font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                  </p>
                </label>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-2">
                  Uploaded Documents
                </h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                    >
                      <div className="flex items-center">
                        <FaFile className="text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {(doc.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-gray-700 font-medium mb-2">Case Summary</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Case Title</p>
                    <p className="font-medium">
                      {formData.title || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Case Type</p>
                    <p className="font-medium">
                      {formData.caseType || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Court</p>
                    <p className="font-medium">
                      {formData.court || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Report Date</p>
                    <p className="font-medium">
                      {formData.reportDate || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plaintiff</p>
                    <p className="font-medium">
                      {formData.plaintiff.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Defendant</p>
                    <p className="font-medium">
                      {formData.defendant.name || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">Case Description</p>
                  <p className="text-sm mt-1">
                    {formData.description || "Not provided"}
                  </p>
                </div>
              </div>
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
                disabled={loading || submitSuccess}
                className="px-5 py-3 bg-tertiary text-white rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300 disabled:opacity-50"
              >
                {loading ? "Filing Case..." : "Submit Case"}
              </button>
            </div>
          </form>
        </div>
      </ClientLayout>
    </section>
  );
};

export default NewCaseDocuments;
