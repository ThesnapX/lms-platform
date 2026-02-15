import { useState } from "react";
import { XMarkIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "../../utils/axios";

const AddCourseModal = ({ isOpen, onClose, onCourseAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "", // Add this field
    price: "",
    discountedPrice: "",
    thumbnail: null,
    chapters: [
      {
        title: "",
        topics: [
          {
            title: "",
            description: "",
            youtubeLink: "",
            isPreview: false,
            resources: [],
          },
        ],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculate discount percent when prices change
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newPrice = name === "price" ? parseFloat(value) : formData.price;
    const newDiscounted =
      name === "discountedPrice" ? parseFloat(value) : formData.discountedPrice;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate discount percent
    if (newPrice > 0 && newDiscounted > 0 && newDiscounted < newPrice) {
      const percent = Math.round(((newPrice - newDiscounted) / newPrice) * 100);
      setDiscountPercent(percent);
    } else {
      setDiscountPercent(0);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("File size must be less than 1MB");
        e.target.value = null;
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        e.target.value = null;
        return;
      }

      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleChapterChange = (chapterIndex, field, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex][field] = value;
    setFormData((prev) => ({
      ...prev,
      chapters: updatedChapters,
    }));
  };

  const handleTopicChange = (chapterIndex, topicIndex, field, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].topics[topicIndex][field] = value;
    setFormData((prev) => ({
      ...prev,
      chapters: updatedChapters,
    }));
  };

  const addChapter = () => {
    setFormData((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        {
          title: "",
          topics: [
            {
              title: "",
              description: "",
              youtubeLink: "",
              isPreview: false,
              resources: [],
            },
          ],
        },
      ],
    }));
  };

  const removeChapter = (chapterIndex) => {
    if (formData.chapters.length > 1) {
      setFormData((prev) => ({
        ...prev,
        chapters: prev.chapters.filter((_, index) => index !== chapterIndex),
      }));
    }
  };

  const addTopic = (chapterIndex) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].topics.push({
      title: "",
      description: "",
      youtubeLink: "",
      isPreview: false,
      resources: [],
    });
    setFormData((prev) => ({
      ...prev,
      chapters: updatedChapters,
    }));
  };

  const removeTopic = (chapterIndex, topicIndex) => {
    if (formData.chapters[chapterIndex].topics.length > 1) {
      const updatedChapters = [...formData.chapters];
      updatedChapters[chapterIndex].topics = updatedChapters[
        chapterIndex
      ].topics.filter((_, index) => index !== topicIndex);
      setFormData((prev) => ({
        ...prev,
        chapters: updatedChapters,
      }));
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "lms_unsigned_preset");
    cloudinaryFormData.append("folder", "lms/thumbnails");

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!formData.thumbnail) {
        alert("Please select a thumbnail image");
        setLoading(false);
        return;
      }

      // Validate discounted price
      if (
        formData.discountedPrice &&
        parseFloat(formData.discountedPrice) >= parseFloat(formData.price)
      ) {
        alert("Discounted price must be less than regular price");
        setLoading(false);
        return;
      }

      console.log("📤 Uploading to Cloudinary...");
      const cloudinaryResult = await uploadToCloudinary(formData.thumbnail);

      const courseData = {
        title: formData.title,
        description: formData.description,
        instructor: formData.instructor, // Add instructor
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice
          ? parseFloat(formData.discountedPrice)
          : undefined,
        thumbnail: {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
        },
        chapters: formData.chapters.map((chapter) => ({
          title: chapter.title,
          topics: chapter.topics.map((topic) => ({
            title: topic.title,
            description: topic.description,
            youtubeLink: topic.youtubeLink,
            isPreview: topic.isPreview,
            resources: topic.resources || [],
          })),
        })),
      };

      console.log("📤 Sending course data to backend...");
      const response = await axios.post("/courses", courseData);

      alert("Course created successfully!");
      onCourseAdded(response.data.course);
      onClose();

      // Reset form
      setFormData({
        title: "",
        description: "",
        instructor: "",
        price: "",
        discountedPrice: "",
        thumbnail: null,
        chapters: [
          {
            title: "",
            topics: [
              {
                title: "",
                description: "",
                youtubeLink: "",
                isPreview: false,
                resources: [],
              },
            ],
          },
        ],
      });
      setDiscountPercent(0);
      setPreviewImage(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error creating course:", error);
      alert(
        "Failed to create course: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Add New Course
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Complete Web Development Bootcamp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe what students will learn..."
              />
            </div>

            {/* Instructor Field - NEW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructor Name *
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., John Smith, Sarah Johnson, etc."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the name of the instructor who created this course
              </p>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Regular Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="4999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discounted Price (Optional)
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handlePriceChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="3999"
                />
              </div>
            </div>

            {/* Discount Preview */}
            {discountPercent > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  🎉 <span className="font-bold">{discountPercent}% OFF</span> -
                  Students save ₹
                  {parseFloat(formData.price) -
                    parseFloat(formData.discountedPrice)}
                </p>
              </div>
            )}

            {formData.discountedPrice &&
              parseFloat(formData.discountedPrice) >=
                parseFloat(formData.price) && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ⚠️ Discounted price must be less than regular price
                  </p>
                </div>
              )}

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course Thumbnail (16:9, max 1MB) *
              </label>
              <input
                type="file"
                name="thumbnail"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleThumbnailChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {previewImage && (
                <div className="mt-2">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-48 h-27 object-cover rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.thumbnail?.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chapters Section - Keep existing chapters code */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
                Course Chapters
              </h3>
              <button
                type="button"
                onClick={addChapter}
                className="flex items-center space-x-2 text-lime-600 hover:text-lime-700 dark:text-lime-400"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Chapter</span>
              </button>
            </div>

            {/* ... rest of chapters code (same as before) ... */}
            {formData.chapters.map((chapter, chapterIndex) => (
              // ... keep your existing chapter mapping code
              <div
                key={chapterIndex}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
              >
                {/* Chapter content */}
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-lime-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
