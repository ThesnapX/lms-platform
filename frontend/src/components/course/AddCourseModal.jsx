import { useState } from "react";
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import axios from "../../utils/axios";

const AddCourseModal = ({ isOpen, onClose, onCourseAdded }) => {
  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // State for collapsible sections
  const [expandedChapters, setExpandedChapters] = useState([0]); // First chapter expanded by default
  const [expandedTopics, setExpandedTopics] = useState({}); // Track expanded topics by chapter and topic index

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

  // Chapter management
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
    // Expand the new chapter
    setExpandedChapters((prev) => [...prev, prev.length]);
  };

  const removeChapter = (chapterIndex) => {
    if (formData.chapters.length > 1) {
      setFormData((prev) => ({
        ...prev,
        chapters: prev.chapters.filter((_, index) => index !== chapterIndex),
      }));
      // Remove from expanded chapters
      setExpandedChapters((prev) =>
        prev
          .filter((index) => index !== chapterIndex)
          .map((i) => (i > chapterIndex ? i - 1 : i)),
      );
    }
  };

  const toggleChapter = (chapterIndex) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterIndex)
        ? prev.filter((i) => i !== chapterIndex)
        : [...prev, chapterIndex],
    );
  };

  const handleChapterChange = (chapterIndex, field, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex][field] = value;
    setFormData((prev) => ({
      ...prev,
      chapters: updatedChapters,
    }));
  };

  // Topic management
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

    // Auto-expand the new topic
    const topicKey = `${chapterIndex}-${updatedChapters[chapterIndex].topics.length - 1}`;
    setExpandedTopics((prev) => ({ ...prev, [topicKey]: true }));
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

      // Remove from expanded topics
      const topicKey = `${chapterIndex}-${topicIndex}`;
      setExpandedTopics((prev) => {
        const newState = { ...prev };
        delete newState[topicKey];
        return newState;
      });
    }
  };

  const toggleTopic = (chapterIndex, topicIndex) => {
    const topicKey = `${chapterIndex}-${topicIndex}`;
    setExpandedTopics((prev) => ({
      ...prev,
      [topicKey]: !prev[topicKey],
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

  // Resource management
  const addResource = (chapterIndex, topicIndex) => {
    const updatedChapters = [...formData.chapters];
    if (!updatedChapters[chapterIndex].topics[topicIndex].resources) {
      updatedChapters[chapterIndex].topics[topicIndex].resources = [];
    }
    updatedChapters[chapterIndex].topics[topicIndex].resources.push({
      title: "",
      url: "",
    });
    setFormData((prev) => ({
      ...prev,
      chapters: updatedChapters,
    }));
  };

  const removeResource = (chapterIndex, topicIndex, resourceIndex) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].topics[topicIndex].resources =
      updatedChapters[chapterIndex].topics[topicIndex].resources.filter(
        (_, index) => index !== resourceIndex,
      );
    setFormData((prev) => ({
      ...prev,
      chapters: updatedChapters,
    }));
  };

  const handleResourceChange = (
    chapterIndex,
    topicIndex,
    resourceIndex,
    field,
    value,
  ) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].topics[topicIndex].resources[resourceIndex][
      field
    ] = value;
    setFormData((prev) => ({
      ...prev,
      chapters: updatedChapters,
    }));
  };

  const uploadToCloudinary = async (file) => {
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", "course_unsigned_preset");
    cloudinaryFormData.append("folder", "course/thumbnails");

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

      console.log("📤 Uploading thumbnail to Cloudinary...");
      const cloudinaryResult = await uploadToCloudinary(formData.thumbnail);

      // Prepare course data with chapters, topics, and resources
      const courseData = {
        title: formData.title,
        description: formData.description,
        instructor: formData.instructor,
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
            isPreview: topic.isPreview || false,
            resources: (topic.resources || []).map((resource) => ({
              title: resource.title,
              url: resource.url,
            })),
          })),
        })),
      };

      console.log("📤 Sending course data to backend:", courseData);
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
      setExpandedChapters([0]);
      setExpandedTopics({});
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
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
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

            {/* Instructor Field */}
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
                placeholder="e.g., John Smith, Sarah Johnson"
              />
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

          {/* Chapters Section */}
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

            {formData.chapters.map((chapter, chapterIndex) => (
              <div
                key={chapterIndex}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Chapter Header - Collapsible */}
                <div
                  onClick={() => toggleChapter(chapterIndex)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    {expandedChapters.includes(chapterIndex) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      Chapter {chapterIndex + 1}: {chapter.title || "Untitled"}
                    </span>
                  </div>
                  {formData.chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChapter(chapterIndex);
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Chapter Content - Collapsible */}
                {expandedChapters.includes(chapterIndex) && (
                  <div className="p-4 space-y-4">
                    {/* Chapter Title Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chapter Title *
                      </label>
                      <input
                        type="text"
                        value={chapter.title}
                        onChange={(e) =>
                          handleChapterChange(
                            chapterIndex,
                            "title",
                            e.target.value,
                          )
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Getting Started"
                      />
                    </div>

                    {/* Topics Section */}
                    <div className="space-y-3 pl-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Topics
                        </h4>
                        <button
                          type="button"
                          onClick={() => addTopic(chapterIndex)}
                          className="flex items-center space-x-1 text-lime-600 hover:text-lime-700 dark:text-lime-400 text-sm"
                        >
                          <PlusIcon className="h-4 w-4" />
                          <span>Add Topic</span>
                        </button>
                      </div>

                      {chapter.topics.map((topic, topicIndex) => {
                        const topicKey = `${chapterIndex}-${topicIndex}`;
                        const isTopicExpanded = expandedTopics[topicKey];

                        return (
                          <div
                            key={topicIndex}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ml-2"
                          >
                            {/* Topic Header - Collapsible */}
                            <div
                              onClick={() =>
                                toggleTopic(chapterIndex, topicIndex)
                              }
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <div className="flex items-center space-x-2 flex-1">
                                {isTopicExpanded ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  Topic {topicIndex + 1}:{" "}
                                  {topic.title || "Untitled"}
                                </span>
                              </div>
                              {chapter.topics.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTopic(chapterIndex, topicIndex);
                                  }}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {/* Topic Content - Collapsible */}
                            {isTopicExpanded && (
                              <div className="p-3 space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Topic Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={topic.title}
                                    onChange={(e) =>
                                      handleTopicChange(
                                        chapterIndex,
                                        topicIndex,
                                        "title",
                                        e.target.value,
                                      )
                                    }
                                    required
                                    className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g., Introduction"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description *
                                  </label>
                                  <textarea
                                    value={topic.description}
                                    onChange={(e) =>
                                      handleTopicChange(
                                        chapterIndex,
                                        topicIndex,
                                        "description",
                                        e.target.value,
                                      )
                                    }
                                    required
                                    rows="2"
                                    className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="What will this topic cover?"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    YouTube Link *
                                  </label>
                                  <input
                                    type="url"
                                    value={topic.youtubeLink}
                                    onChange={(e) =>
                                      handleTopicChange(
                                        chapterIndex,
                                        topicIndex,
                                        "youtubeLink",
                                        e.target.value,
                                      )
                                    }
                                    required
                                    className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                  />
                                </div>

                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={topic.isPreview}
                                    onChange={(e) =>
                                      handleTopicChange(
                                        chapterIndex,
                                        topicIndex,
                                        "isPreview",
                                        e.target.checked,
                                      )
                                    }
                                    className="h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                                  />
                                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    Make this a free preview
                                  </label>
                                </div>

                                {/* Resources Section */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      Resources (Optional)
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        addResource(chapterIndex, topicIndex)
                                      }
                                      className="flex items-center space-x-1 text-lime-600 hover:text-lime-700 dark:text-lime-400 text-xs"
                                    >
                                      <PlusIcon className="h-3 w-3" />
                                      <span>Add Resource</span>
                                    </button>
                                  </div>

                                  {topic.resources?.map(
                                    (resource, resourceIndex) => (
                                      <div
                                        key={resourceIndex}
                                        className="flex items-center space-x-2"
                                      >
                                        <DocumentIcon className="h-4 w-4 text-gray-400" />
                                        <input
                                          type="text"
                                          value={resource.title}
                                          onChange={(e) =>
                                            handleResourceChange(
                                              chapterIndex,
                                              topicIndex,
                                              resourceIndex,
                                              "title",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Resource title"
                                          className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-lime-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <input
                                          type="url"
                                          value={resource.url}
                                          onChange={(e) =>
                                            handleResourceChange(
                                              chapterIndex,
                                              topicIndex,
                                              resourceIndex,
                                              "url",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Resource URL"
                                          className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-lime-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeResource(
                                              chapterIndex,
                                              topicIndex,
                                              resourceIndex,
                                            )
                                          }
                                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                                        >
                                          <TrashIcon className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
