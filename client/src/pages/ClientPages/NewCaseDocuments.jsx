/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ClientLayout from "../../components/ClientLayout";
import { casesAPI, documentsAPI } from "../../services/api";
import {
  FaUpload,
  FaFile,
  FaEye,
  FaTrash,
  FaDownload,
  FaSpinner,
} from "react-icons/fa";

const NewCaseDocuments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(4);

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

  const [documents, setDocuments] = useState([]);
  const [compliance, setCompliance] = useState({
    verificationStatement: false,
    perjuryAcknowledgment: false,
    courtRulesAcknowledgment: false,
    electronicSignature: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);

  // Redirect if no form data
  useEffect(() => {
    if (!location.state?.formData) {
      navigate("/client/newcase");
    }
  }, [location.state, navigate]);

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is 10MB.`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File "${file.name}" has an unsupported format. Only PDF, DOC, DOCX, JPG, PNG, GIF, and TXT files are allowed.`;
    }

    return null;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : null,
          uploaded: false,
        });
      }
    });

    if (errors.length > 0) {
      setSubmitError(errors.join(" "));
      setTimeout(() => setSubmitError(""), 5000);
    }

    if (validFiles.length > 0) {
      setDocuments([...documents, ...validFiles]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  const removeDocument = (id) => {
    const updatedDocuments = documents.filter((doc) => doc.id !== id);
    setDocuments(updatedDocuments);
  };

  const handleBack = () => {
    navigate("/client/newcase/legal-details", {
      state: { formData: { ...formData, documents } },
    });
  };

  // Check for duplicate cases
  const checkForDuplicates = async () => {
    setCheckingDuplicates(true);
    try {
      const duplicateCheckData = {
        title: formData.title,
        description: formData.description,
        defendant: formData.defendant,
        caseType: formData.caseType,
        court: formData.court,
      };

      const response = await casesAPI.checkDuplicates(duplicateCheckData);

      if (response.data.hasDuplicates) {
        setDuplicateWarning(response.data);
        setShowDuplicateModal(true);
        return false; // Don't proceed with filing
      }

      return true; // No duplicates, can proceed
    } catch (error) {
      console.error("Error checking duplicates:", error);
      // If duplicate check fails, allow filing to proceed
      return true;
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleDuplicateConfirm = () => {
    setConfirmDuplicate(true);
    setShowDuplicateModal(false);
    // Proceed with filing
    submitCase(true);
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setDuplicateWarning(null);
  };

  const submitCase = async (skipDuplicateCheck = false) => {
    setLoading(true);
    setSubmitError("");

    try {
      // Prepare comprehensive case data for backend API
      const caseData = {
        title: formData.title,
        description: formData.description,
        caseType: formData.caseType,
        court: formData.court,
        reportDate: formData.reportDate,
        evidence: formData.evidence || "",
        defendant: {
          name: formData.defendant.name,
          email: formData.defendant.email || "",
          phone: formData.defendant.phone || "",
          address: formData.defendant.address || "",
        },
        plaintiff: {
          name: formData.plaintiff.name || "",
          email: formData.plaintiff.email || "",
          phone: formData.plaintiff.phone || "",
          address: formData.plaintiff.address || "",
        },
        // Phase 1 - Essential Fields
        priority: formData.priority || "Medium",
        urgencyReason: formData.urgencyReason || "",
        representation: formData.representation || {
          hasLawyer: false,
          selfRepresented: true,
        },
        reliefSought: formData.reliefSought || {},
        compliance: compliance,
        confirmDuplicate: skipDuplicateCheck || confirmDuplicate,
      };

      console.log("Submitting case data:", caseData);

      // Submit case to backend using the configured API service
      const response = await casesAPI.fileCase(caseData);

      console.log("Case submission response:", response.data);

      if (response.status === 201) {
        setLoading(false);
        setSubmitSuccess(true);

        // Redirect after a delay
        setTimeout(() => {
          navigate("/client/mycases");
        }, 2000);
      }
    } catch (err) {
      console.error("Error filing case:", err);
      console.error("Error response:", err.response?.data);

      // Handle duplicate case error specifically
      if (
        err.response?.status === 409 &&
        err.response?.data?.requiresConfirmation
      ) {
        setDuplicateWarning(err.response.data);
        setShowDuplicateModal(true);
        setLoading(false);
        return;
      }

      setSubmitError(
        err.response?.data?.error ||
          err.response?.data?.details ||
          "Failed to file case. Please try again."
      );
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate compliance fields first
    if (!compliance.verificationStatement) {
      setSubmitError(
        "You must verify that the facts stated are true and correct."
      );
      return;
    }

    if (!compliance.perjuryAcknowledgment) {
      setSubmitError("You must acknowledge the perjury warning.");
      return;
    }

    if (!compliance.courtRulesAcknowledgment) {
      setSubmitError("You must acknowledge understanding of court rules.");
      return;
    }

    if (!compliance.electronicSignature.trim()) {
      setSubmitError("Electronic signature is required.");
      return;
    }

    // Clear any previous errors
    setSubmitError("");

    // If not already confirmed, check for duplicates first
    if (!confirmDuplicate) {
      const canProceed = await checkForDuplicates();
      if (!canProceed) {
        return; // Duplicate modal will be shown
      }
    }

    // Proceed with case submission
    await submitCase();
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
              onClick={() =>
                navigate("/client/newcase", {
                  state: { formData: { ...formData, documents } },
                })
              }
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
              onClick={() =>
                navigate("/client/newcase/parties", {
                  state: { formData: { ...formData, documents } },
                })
              }
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
              onClick={() =>
                navigate("/client/newcase/legal-details", {
                  state: { formData: { ...formData, documents } },
                })
              }
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

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="documents"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                />
                <label
                  htmlFor="documents"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  {uploadLoading ? (
                    <FaSpinner className="text-green-500 text-3xl mb-2 animate-spin" />
                  ) : (
                    <FaUpload
                      className={`text-3xl mb-2 ${
                        dragActive ? "text-green-500" : "text-gray-400"
                      }`}
                    />
                  )}
                  <p
                    className={`font-medium ${
                      dragActive ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {dragActive
                      ? "Drop files here"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max 10MB each)
                  </p>
                  {uploadLoading && (
                    <p className="text-green-600 text-sm mt-2">
                      Uploading files...
                    </p>
                  )}
                </label>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-gray-700 font-medium mb-2">
                  Selected Documents ({documents.length})
                </h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        doc.uploaded
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <div className="mr-3">
                          {doc.type.startsWith("image/") ? (
                            <img
                              src={doc.preview}
                              alt={doc.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <FaFile
                              className={`text-2xl ${
                                doc.type === "application/pdf"
                                  ? "text-red-500"
                                  : doc.type.includes("word")
                                  ? "text-blue-500"
                                  : "text-gray-500"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {doc.name}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{(doc.size / 1024).toFixed(1)} KB</span>
                            <span className="capitalize">
                              {doc.type.split("/")[1]}
                            </span>
                            {doc.uploaded && (
                              <span className="text-green-600 font-medium">
                                ✓ Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.preview && (
                          <button
                            type="button"
                            onClick={() => window.open(doc.preview, "_blank")}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Preview"
                          >
                            <FaEye />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Section */}
            <div className="mb-6">
              <h3 className="text-gray-700 font-medium mb-4">
                Legal Compliance & Verification
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>Important:</strong> By filing this case, you are
                  making statements under oath. False statements may result in
                  perjury charges.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="verificationStatement"
                      checked={compliance.verificationStatement}
                      onChange={(e) =>
                        setCompliance((prev) => ({
                          ...prev,
                          verificationStatement: e.target.checked,
                        }))
                      }
                      className="mt-1 mr-3"
                      required
                    />
                    <label
                      htmlFor="verificationStatement"
                      className="text-sm text-gray-700"
                    >
                      <strong>Verification Statement:</strong> I verify that the
                      facts stated in this case filing are true and correct to
                      the best of my knowledge and belief.
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="perjuryAcknowledgment"
                      checked={compliance.perjuryAcknowledgment}
                      onChange={(e) =>
                        setCompliance((prev) => ({
                          ...prev,
                          perjuryAcknowledgment: e.target.checked,
                        }))
                      }
                      className="mt-1 mr-3"
                      required
                    />
                    <label
                      htmlFor="perjuryAcknowledgment"
                      className="text-sm text-gray-700"
                    >
                      <strong>Perjury Acknowledgment:</strong> I understand that
                      making false statements in this filing may subject me to
                      penalties for perjury under applicable law.
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="courtRulesAcknowledgment"
                      checked={compliance.courtRulesAcknowledgment}
                      onChange={(e) =>
                        setCompliance((prev) => ({
                          ...prev,
                          courtRulesAcknowledgment: e.target.checked,
                        }))
                      }
                      className="mt-1 mr-3"
                      required
                    />
                    <label
                      htmlFor="courtRulesAcknowledgment"
                      className="text-sm text-gray-700"
                    >
                      <strong>Court Rules:</strong> I acknowledge that I have
                      read and understand the court rules and procedures
                      applicable to this case.
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Electronic Signature
                  </label>
                  <input
                    type="text"
                    value={compliance.electronicSignature}
                    onChange={(e) =>
                      setCompliance((prev) => ({
                        ...prev,
                        electronicSignature: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Type your full name as electronic signature"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    By typing your name, you are providing your electronic
                    signature for this filing.
                  </p>
                </div>
              </div>
            </div>

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
                className="px-5 py-3 bg-gray-200 text-gray-700 rounded-md hover:scale-95 ease-in-out duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || submitSuccess}
                className="px-5 py-3 bg-tertiary text-white rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300 disabled:opacity-50"
              >
                {checkingDuplicates ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Checking for duplicates...
                  </>
                ) : loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Filing Case...
                  </>
                ) : (
                  "Submit Case"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Duplicate Warning Modal */}
        {showDuplicateModal && duplicateWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
                <FaSpinner className="mr-2" />
                Potential Duplicate Case Detected
              </h2>

              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 mb-2">
                  <strong>Warning:</strong> {duplicateWarning.message}
                </p>
                <p className="text-sm text-yellow-700">
                  Filing duplicate cases may result in case dismissal and could
                  be considered an abuse of the court system.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">
                  Similar Cases Found:
                </h3>
                <div className="space-y-3">
                  {duplicateWarning.duplicates?.map((duplicate, index) => (
                    <div
                      key={duplicate.caseId}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          {duplicate.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            duplicate.status === "Open"
                              ? "bg-green-100 text-green-800"
                              : duplicate.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {duplicate.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Filed:</strong>{" "}
                        {new Date(duplicate.createdAt).toLocaleDateString()}
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Similarity Score:</strong>{" "}
                        {duplicate.similarityScore}%
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Matching Factors:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {duplicate.matchingFactors?.map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <h4 className="font-semibold text-red-800 mb-2">
                  Before Proceeding:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Review the similar cases above carefully</li>
                  <li>
                    • Consider if this is truly a new, separate legal matter
                  </li>
                  <li>• Ensure you're not filing the same case twice</li>
                  <li>• If unsure, consult with legal counsel</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDuplicateCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel & Review
                </button>
                <button
                  onClick={handleDuplicateConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaSpinner className="mr-2" />I Understand - File Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </ClientLayout>
    </section>
  );
};

export default NewCaseDocuments;
