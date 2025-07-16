import { useState } from "react";
import { commentsAPI } from "../../services/api";
import ClientLayout from "../../components/ClientLayout";
import LoadingButton from "../../components/LoadingButton";
import { FaStar, FaRegStar, FaPaperPlane, FaCheckCircle } from "react-icons/fa";

const ClientFeedback = () => {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    rating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.subject.trim() || !formData.message.trim()) {
        throw new Error("Subject and message are required");
      }

      const submitData = {
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      if (formData.rating > 0) {
        submitData.rating = formData.rating;
      }

      await commentsAPI.submitComment(submitData);

      setSuccess(true);
      setFormData({
        subject: "",
        message: "",
        rating: 0,
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingClick(i)}
          className={`text-xl md:text-2xl p-1 md:p-0 transition-colors duration-200 touch-manipulation ${
            i <= formData.rating
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-gray-300 hover:text-yellow-300"
          }`}
          title={`Rate ${i} star${i > 1 ? "s" : ""}`}
        >
          {i <= formData.rating ? <FaStar /> : <FaRegStar />}
        </button>
      );
    }
    return stars;
  };

  return (
    <ClientLayout>
      <div className="px-4 md:px-7 py-4">
        <div className="mx-auto">
          {/* Header */}
          <div className="pb-4 font-Lexend">
            <h1 className="text-xl md:text-2xl font-medium">System Feedback</h1>
            <p className="font-light text-sm md:text-base mt-1">
              We value your feedback! Please share your thoughts about the
              TrialTrack system.
            </p>
          </div>
          {/* Success Message */}
          {success && (
            <div className="mb-4 md:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 flex items-start md:items-center">
              <FaCheckCircle className="text-green-500 mr-2 md:mr-3 mt-0.5 md:mt-0 flex-shrink-0" />
              <div>
                <h3 className="text-green-800 font-medium text-sm md:text-base">
                  Feedback Submitted Successfully!
                </h3>
                <p className="text-green-700 text-xs md:text-sm mt-1">
                  Thank you for your feedback. Our team will review it shortly.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 md:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
              <p className="text-red-800 text-sm md:text-base">{error}</p>
            </div>
          )}

          {/* Feedback Form */}
          <div className="bg-white rounded-lg shadow-md px-4 md:px-7 py-4 md:py-5">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Subject */}
              <div className="mb-4 md:mb-6 relative">
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  maxLength={200}
                  className={`peer w-full border border-gray-300 rounded-lg px-4 md:px-6 pt-5 pb-2 text-sm md:text-base focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary border-gray-300 focus:ring-tertiary`}
                  required
                />
                <label
                  htmlFor="subject"
                  className={`absolute left-3 md:left-5 text-gray-500 duration-200 transition-all text-sm md:text-base ${
                    formData.subject
                      ? " -top-2.5 bg-white px-1"
                      : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                  }`}
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.subject.length}/200 characters
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Rating (Optional)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                  <div className="flex items-center space-x-1">
                    {renderStars()}
                  </div>
                  {formData.rating > 0 && (
                    <span className="sm:ml-3 text-sm text-gray-600">
                      {formData.rating} out of 5 stars
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rate your overall experience with the system
                </p>
              </div>

              {/* Message */}
              <div className="relative mb-4 md:mb-6">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  maxLength={1000}
                  rows={5}
                  className={`peer w-full border border-gray-300 rounded-lg px-4 md:px-6 pt-5 pb-2 text-sm md:text-base focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary border-gray-300 focus:ring-tertiary resize-y min-h-[120px]`}
                  required
                />
                <label
                  htmlFor="message"
                  className={`absolute left-3 md:left-5 text-gray-500 duration-200 transition-all text-sm md:text-base ${
                    formData.message
                      ? " -top-2.5 bg-white px-1"
                      : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                  }`}
                >
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/1000 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  loadingText="Submitting..."
                  disabled={
                    !formData.subject.trim() || !formData.message.trim()
                  }
                  className="w-full md:w-auto px-5 py-3 bg-tertiary text-white rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300 focus:ring-offset-2 text-sm md:text-base font-medium"
                >
                  <FaPaperPlane className="mr-2" />
                  Submit Feedback
                </LoadingButton>
              </div>
            </form>
          </div>

          {/* Information Box */}
          <div className="mt-4 md:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
            <h3 className="text-blue-800 font-medium mb-2 text-sm md:text-base">
              How we use your feedback:
            </h3>
            <ul className="text-blue-700 text-xs md:text-sm space-y-1">
              <li>• Your feedback helps us improve the TrialTrack system</li>
              <li>• All feedback is reviewed by our administrative team</li>
              <li>• We may contact you for clarification if needed</li>
              <li>• Your personal information remains confidential</li>
            </ul>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientFeedback;
