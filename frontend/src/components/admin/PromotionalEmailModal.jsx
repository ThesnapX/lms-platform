import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "../../utils/axios";

const PromotionalEmailModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/admin/send-promotional", { subject, content });
      alert("Emails sent successfully!");
      onClose();
      setSubject("");
      setContent("");
    } catch (error) {
      alert("Failed to send emails");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b flex justify-between">
          <h2 className="text-xl font-bold">Send Promotional Email</h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Content (HTML allowed) *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="8"
              className="w-full px-4 py-2 border rounded font-mono"
              placeholder="<h1>Title</h1><p>Content...</p>"
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-lime-500 text-white rounded"
            >
              {loading ? "Sending..." : "Send to All Users"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionalEmailModal;
