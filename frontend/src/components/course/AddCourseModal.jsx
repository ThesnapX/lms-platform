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
    shortDescription: "",
    longDescription: "",
    instructor: "",
    tag: "",
    categories: [],
    totalHours: "",
    forWhom: "",
    prerequisite: "",
    previewVideoLink: "",
    price: "",
    discountedPrice: "",
    thumbnail: null,
    chapters: [
      {
        title: "",
        description: "",
        topics: [
          {
            title: "",
            description: "",
            youtubeLink: "",
            resources: [],
          },
        ],
        subChapters: [],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const [expandedChapters, setExpandedChapters] = useState([0]);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [expandedSubChapters, setExpandedSubChapters] = useState({});

  const categoryOptions = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "DevOps",
    "Design",
    "Business",
    "Marketing",
    "AI & Machine Learning",
    "Cloud Computing",
    "Cybersecurity",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, categories: selected }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const price = name === "price" ? parseFloat(value) : formData.price;
    const disc =
      name === "discountedPrice" ? parseFloat(value) : formData.discountedPrice;

    if (price > 0 && disc > 0 && disc < price) {
      setDiscountPercent(Math.round(((price - disc) / price) * 100));
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
      setFormData((prev) => ({ ...prev, thumbnail: file }));
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
          description: "",
          topics: [
            {
              title: "",
              description: "",
              youtubeLink: "",
              resources: [],
            },
          ],
          subChapters: [],
        },
      ],
    }));
    setExpandedChapters((prev) => [...prev, prev.length]);
  };

  const removeChapter = (index) => {
    if (formData.chapters.length > 1) {
      setFormData((prev) => ({
        ...prev,
        chapters: prev.chapters.filter((_, i) => i !== index),
      }));
      setExpandedChapters((prev) =>
        prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
      );
    }
  };

  const toggleChapter = (index) => {
    setExpandedChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleChapterChange = (index, field, value) => {
    const updated = [...formData.chapters];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  // Topic management
  const addTopic = (chapterIndex, subChapterIndex = null) => {
    const updated = [...formData.chapters];
    if (subChapterIndex !== null) {
      updated[chapterIndex].subChapters[subChapterIndex].topics.push({
        title: "",
        description: "",
        youtubeLink: "",
        resources: [],
      });
    } else {
      updated[chapterIndex].topics.push({
        title: "",
        description: "",
        youtubeLink: "",
        resources: [],
      });
    }
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  const removeTopic = (chapterIndex, topicIndex, subChapterIndex = null) => {
    const updated = [...formData.chapters];
    if (subChapterIndex !== null) {
      updated[chapterIndex].subChapters[subChapterIndex].topics = updated[
        chapterIndex
      ].subChapters[subChapterIndex].topics.filter((_, i) => i !== topicIndex);
    } else {
      updated[chapterIndex].topics = updated[chapterIndex].topics.filter(
        (_, i) => i !== topicIndex,
      );
    }
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  const toggleTopic = (chapterIndex, topicIndex, subChapterIndex = null) => {
    const key =
      subChapterIndex !== null
        ? `${chapterIndex}-sub-${subChapterIndex}-${topicIndex}`
        : `${chapterIndex}-${topicIndex}`;
    setExpandedTopics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTopicChange = (
    chapterIndex,
    topicIndex,
    field,
    value,
    subChapterIndex = null,
  ) => {
    const updated = [...formData.chapters];
    if (subChapterIndex !== null) {
      updated[chapterIndex].subChapters[subChapterIndex].topics[topicIndex][
        field
      ] = value;
    } else {
      updated[chapterIndex].topics[topicIndex][field] = value;
    }
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  // Sub-chapter management
  const addSubChapter = (chapterIndex) => {
    const updated = [...formData.chapters];
    updated[chapterIndex].subChapters.push({
      title: "",
      description: "",
      topics: [
        {
          title: "",
          description: "",
          youtubeLink: "",
          resources: [],
        },
      ],
    });
    setFormData((prev) => ({ ...prev, chapters: updated }));
    const key = `${chapterIndex}-sub-${updated[chapterIndex].subChapters.length - 1}`;
    setExpandedSubChapters((prev) => ({ ...prev, [key]: true }));
  };

  const toggleSubChapter = (chapterIndex, subIndex) => {
    const key = `${chapterIndex}-sub-${subIndex}`;
    setExpandedSubChapters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubChapterChange = (chapterIndex, subIndex, field, value) => {
    const updated = [...formData.chapters];
    updated[chapterIndex].subChapters[subIndex][field] = value;
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  // Resource management
  const addResource = (chapterIndex, topicIndex, subChapterIndex = null) => {
    const updated = [...formData.chapters];
    if (subChapterIndex !== null) {
      const topic =
        updated[chapterIndex].subChapters[subChapterIndex].topics[topicIndex];
      if (!topic.resources) topic.resources = [];
      topic.resources.push({ title: "", url: "" });
    } else {
      const topic = updated[chapterIndex].topics[topicIndex];
      if (!topic.resources) topic.resources = [];
      topic.resources.push({ title: "", url: "" });
    }
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  const removeResource = (
    chapterIndex,
    topicIndex,
    resourceIndex,
    subChapterIndex = null,
  ) => {
    const updated = [...formData.chapters];
    if (subChapterIndex !== null) {
      updated[chapterIndex].subChapters[subChapterIndex].topics[
        topicIndex
      ].resources = updated[chapterIndex].subChapters[subChapterIndex].topics[
        topicIndex
      ].resources.filter((_, i) => i !== resourceIndex);
    } else {
      updated[chapterIndex].topics[topicIndex].resources = updated[
        chapterIndex
      ].topics[topicIndex].resources.filter((_, i) => i !== resourceIndex);
    }
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  const handleResourceChange = (
    chapterIndex,
    topicIndex,
    resourceIndex,
    field,
    value,
    subChapterIndex = null,
  ) => {
    const updated = [...formData.chapters];
    if (subChapterIndex !== null) {
      updated[chapterIndex].subChapters[subChapterIndex].topics[
        topicIndex
      ].resources[resourceIndex][field] = value;
    } else {
      updated[chapterIndex].topics[topicIndex].resources[resourceIndex][field] =
        value;
    }
    setFormData((prev) => ({ ...prev, chapters: updated }));
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lms_unsigned_preset");
    formData.append("folder", "course/thumbnails");

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.thumbnail) {
        alert("Please select a thumbnail");
        setLoading(false);
        return;
      }

      if (
        formData.discountedPrice &&
        parseFloat(formData.discountedPrice) >= parseFloat(formData.price)
      ) {
        alert("Discounted price must be less than regular price");
        setLoading(false);
        return;
      }

      const cloudinaryResult = await uploadToCloudinary(formData.thumbnail);

      const courseData = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        instructor: formData.instructor,
        tag: formData.tag,
        categories: formData.categories,
        totalHours: parseFloat(formData.totalHours),
        forWhom: formData.forWhom,
        prerequisite: formData.prerequisite || "No prerequisites required",
        previewVideoLink: formData.previewVideoLink,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice
          ? parseFloat(formData.discountedPrice)
          : undefined,
        thumbnail: {
          public_id: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url,
        },
        chapters: formData.chapters.map((ch) => ({
          title: ch.title,
          description: ch.description,
          topics: ch.topics.map((t) => ({
            title: t.title,
            description: t.description,
            youtubeLink: t.youtubeLink,
            resources: t.resources || [],
          })),
          subChapters: ch.subChapters.map((sub) => ({
            title: sub.title,
            description: sub.description,
            topics: sub.topics.map((t) => ({
              title: t.title,
              description: t.description,
              youtubeLink: t.youtubeLink,
              resources: t.resources || [],
            })),
          })),
        })),
      };

      const response = await axios.post("/courses", courseData);
      alert("Course created!");
      onCourseAdded(response.data.course);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Course
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                required
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag
              </label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                placeholder="e.g., React, Python"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categories <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                value={formData.categories}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition h-32"
                required
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat} className="py-1">
                    {cat}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Hold Ctrl to select multiple
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalHours"
                  value={formData.totalHours}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  For Whom <span className="text-red-500">*</span>
                </label>
                <select
                  name="forWhom"
                  value={formData.forWhom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                >
                  <option value="">Select</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prerequisite
              </label>
              <input
                type="text"
                name="prerequisite"
                value={formData.prerequisite}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                placeholder="e.g., Basic JavaScript"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Preview Video Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="previewVideoLink"
                value={formData.previewVideoLink}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  required
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Discounted Price
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handlePriceChange}
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  🎉 {discountPercent}% OFF - Save ₹
                  {parseFloat(formData.price) -
                    parseFloat(formData.discountedPrice)}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thumbnail (16:9, max 1MB){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-lime-500 dark:hover:border-lime-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  required
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100 dark:file:bg-lime-900/30 dark:file:text-lime-400"
                />
              </div>
              {previewImage && (
                <div className="mt-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-48 h-27 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chapters
              </h3>
              <button
                type="button"
                onClick={addChapter}
                className="inline-flex items-center px-3 py-1.5 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 rounded-lg hover:bg-lime-200 dark:hover:bg-lime-900/50 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Add Chapter</span>
              </button>
            </div>

            {formData.chapters.map((chapter, ci) => (
              <div
                key={ci}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
              >
                {/* Chapter Header */}
                <div
                  onClick={() => toggleChapter(ci)}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    {expandedChapters.includes(ci) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      Chapter {ci + 1}: {chapter.title || "Untitled"}
                    </span>
                  </div>
                  {formData.chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChapter(ci);
                      }}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Chapter Content */}
                {expandedChapters.includes(ci) && (
                  <div className="p-4 space-y-4">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) =>
                        handleChapterChange(ci, "title", e.target.value)
                      }
                      placeholder="Chapter Title"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                    />
                    <textarea
                      value={chapter.description || ""}
                      onChange={(e) =>
                        handleChapterChange(ci, "description", e.target.value)
                      }
                      placeholder="Chapter Description (optional)"
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent transition"
                    />

                    {/* Topics */}
                    <div className="pl-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Topics
                        </h4>
                        <button
                          type="button"
                          onClick={() => addTopic(ci)}
                          className="inline-flex items-center px-2 py-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 rounded hover:bg-lime-200 dark:hover:bg-lime-900/50 transition-colors text-xs"
                        >
                          <PlusIcon className="h-3 w-3 mr-1" />
                          Add Topic
                        </button>
                      </div>

                      {chapter.topics.map((topic, ti) => {
                        const key = `${ci}-${ti}`;
                        return (
                          <div
                            key={ti}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50"
                          >
                            {/* Topic Header */}
                            <div
                              onClick={() => toggleTopic(ci, ti)}
                              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center">
                                {expandedTopics[key] ? (
                                  <ChevronDownIcon className="h-4 w-4 mr-2 text-gray-500" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 mr-2 text-gray-500" />
                                )}
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  Topic {ti + 1}: {topic.title || "Untitled"}
                                </span>
                              </div>
                              {chapter.topics.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeTopic(ci, ti);
                                  }}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            {/* Topic Content */}
                            {expandedTopics[key] && (
                              <div className="p-3 space-y-3">
                                <input
                                  type="text"
                                  value={topic.title}
                                  onChange={(e) =>
                                    handleTopicChange(
                                      ci,
                                      ti,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Topic Title"
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-lime-500"
                                />
                                <textarea
                                  value={topic.description}
                                  onChange={(e) =>
                                    handleTopicChange(
                                      ci,
                                      ti,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Topic Description"
                                  rows="2"
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-lime-500"
                                />
                                <input
                                  type="url"
                                  value={topic.youtubeLink}
                                  onChange={(e) =>
                                    handleTopicChange(
                                      ci,
                                      ti,
                                      "youtubeLink",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="YouTube Link"
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-lime-500"
                                />

                                {/* Resources */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Resources
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => addResource(ci, ti)}
                                      className="text-lime-600 hover:text-lime-700 text-xs flex items-center"
                                    >
                                      <PlusIcon className="h-3 w-3 mr-1" />
                                      Add
                                    </button>
                                  </div>
                                  {topic.resources?.map((res, ri) => (
                                    <div
                                      key={ri}
                                      className="flex items-center space-x-2"
                                    >
                                      <DocumentIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                      <input
                                        type="text"
                                        value={res.title}
                                        onChange={(e) =>
                                          handleResourceChange(
                                            ci,
                                            ti,
                                            ri,
                                            "title",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Title"
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                      <input
                                        type="url"
                                        value={res.url}
                                        onChange={(e) =>
                                          handleResourceChange(
                                            ci,
                                            ti,
                                            ri,
                                            "url",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="URL"
                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeResource(ci, ti, ri)
                                        }
                                        className="text-red-500 hover:text-red-600"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Sub-chapters */}
                    <div className="pl-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sub-chapters
                        </h4>
                        <button
                          type="button"
                          onClick={() => addSubChapter(ci)}
                          className="inline-flex items-center px-2 py-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 rounded hover:bg-lime-200 dark:hover:bg-lime-900/50 transition-colors text-xs"
                        >
                          <PlusIcon className="h-3 w-3 mr-1" />
                          Add Sub-chapter
                        </button>
                      </div>

                      {chapter.subChapters?.map((sub, si) => {
                        const key = `${ci}-sub-${si}`;
                        return (
                          <div
                            key={si}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ml-4 bg-gray-50 dark:bg-gray-800/50"
                          >
                            {/* Sub-chapter Header */}
                            <div
                              onClick={() => toggleSubChapter(ci, si)}
                              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center">
                                {expandedSubChapters[key] ? (
                                  <ChevronDownIcon className="h-4 w-4 mr-2 text-gray-500" />
                                ) : (
                                  <ChevronRightIcon className="h-4 w-4 mr-2 text-gray-500" />
                                )}
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  Sub {si + 1}: {sub.title || "Untitled"}
                                </span>
                              </div>
                            </div>

                            {/* Sub-chapter Content */}
                            {expandedSubChapters[key] && (
                              <div className="p-3 space-y-3">
                                <input
                                  type="text"
                                  value={sub.title}
                                  onChange={(e) =>
                                    handleSubChapterChange(
                                      ci,
                                      si,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Sub-chapter Title"
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-lime-500"
                                />
                                <textarea
                                  value={sub.description || ""}
                                  onChange={(e) =>
                                    handleSubChapterChange(
                                      ci,
                                      si,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Description"
                                  rows="2"
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-lime-500"
                                />

                                {/* Topics in sub-chapter */}
                                <div className="pl-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      Topics
                                    </h5>
                                    <button
                                      type="button"
                                      onClick={() => addTopic(ci, si)}
                                      className="text-lime-600 hover:text-lime-700 text-xs flex items-center"
                                    >
                                      <PlusIcon className="h-3 w-3 mr-1" />
                                      Add
                                    </button>
                                  </div>
                                  {sub.topics?.map((topic, ti) => {
                                    const tKey = `${ci}-sub-${si}-${ti}`;
                                    return (
                                      <div
                                        key={ti}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2"
                                      >
                                        <div
                                          onClick={() =>
                                            toggleTopic(ci, ti, si)
                                          }
                                          className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                          <div className="flex items-center">
                                            {expandedTopics[tKey] ? (
                                              <ChevronDownIcon className="h-3 w-3 mr-1" />
                                            ) : (
                                              <ChevronRightIcon className="h-3 w-3 mr-1" />
                                            )}
                                            <span className="text-xs">
                                              Topic {ti + 1}
                                            </span>
                                          </div>
                                        </div>
                                        {expandedTopics[tKey] && (
                                          <div className="p-2 space-y-2">
                                            <input
                                              type="text"
                                              value={topic.title}
                                              onChange={(e) =>
                                                handleTopicChange(
                                                  ci,
                                                  ti,
                                                  "title",
                                                  e.target.value,
                                                  si,
                                                )
                                              }
                                              placeholder="Title"
                                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                            />
                                            <textarea
                                              value={topic.description}
                                              onChange={(e) =>
                                                handleTopicChange(
                                                  ci,
                                                  ti,
                                                  "description",
                                                  e.target.value,
                                                  si,
                                                )
                                              }
                                              placeholder="Description"
                                              rows="1"
                                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                            />
                                            <input
                                              type="url"
                                              value={topic.youtubeLink}
                                              onChange={(e) =>
                                                handleTopicChange(
                                                  ci,
                                                  ti,
                                                  "youtubeLink",
                                                  e.target.value,
                                                  si,
                                                )
                                              }
                                              placeholder="YouTube Link"
                                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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

          {/* Submit */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
