const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");

dotenv.config();

const sampleCourses = [
  {
    title: "Complete Web Development Bootcamp 2024",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and MongoDB. Build 10+ full-stack projects and become a professional web developer.",
    price: 4999,
    thumbnail: {
      public_id: "sample_thumbnail_1",
      url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1631&q=80",
    },
    chapters: [
      {
        title: "Getting Started with Web Development",
        topics: [
          {
            title: "Introduction to the Course",
            description:
              "Welcome to the Complete Web Development Bootcamp! In this introductory video, we'll cover what you'll learn and how to make the most of this course.",
            youtubeLink: "https://www.youtube.com/watch?v=VIDEO_ID_1",
            isPreview: true,
            resources: [
              {
                title: "Course Syllabus PDF",
                url: "https://example.com/syllabus.pdf",
              },
            ],
          },
          {
            title: "Setting Up Your Development Environment",
            description:
              "Learn how to set up VS Code, Node.js, and other essential tools for web development.",
            youtubeLink: "https://www.youtube.com/watch?v=VIDEO_ID_2",
            isPreview: true,
          },
        ],
      },
      {
        title: "HTML & CSS Fundamentals",
        topics: [
          {
            title: "HTML5 Basics",
            description:
              "Learn the fundamentals of HTML5 including semantic elements, forms, and multimedia.",
            youtubeLink: "https://www.youtube.com/watch?v=VIDEO_ID_3",
            isPreview: true,
          },
          {
            title: "CSS3 Styling",
            description:
              "Master CSS3 including flexbox, grid, animations, and responsive design.",
            youtubeLink: "https://www.youtube.com/watch?v=VIDEO_ID_4",
            isPreview: false,
          },
        ],
      },
    ],
  },
  {
    title: "Advanced React with Redux Toolkit",
    description:
      "Master React.js with Redux Toolkit. Learn hooks, custom hooks, context API, and build enterprise-level applications.",
    price: 3999,
    thumbnail: {
      public_id: "sample_thumbnail_2",
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    chapters: [
      {
        title: "React Fundamentals Review",
        topics: [
          {
            title: "Components and Props",
            description:
              "Review of React components, props, and component composition.",
            youtubeLink: "https://www.youtube.com/watch?v=VIDEO_ID_5",
            isPreview: true,
          },
          {
            title: "State and Lifecycle",
            description:
              "Understanding useState, useEffect, and component lifecycle.",
            youtubeLink: "https://www.youtube.com/watch?v=VIDEO_ID_6",
            isPreview: true,
          },
        ],
      },
    ],
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@lms.io",
      password: "admin123",
      role: "admin",
    });
    console.log("Admin user created");

    // Create editor user
    const editorUser = await User.create({
      name: "Editor User",
      email: "editor@lms.io",
      password: "editor123",
      role: "editor",
    });
    console.log("Editor user created");

    // Create visitor user
    const visitorUser = await User.create({
      name: "Visitor User",
      email: "visitor@lms.io",
      password: "visitor123",
      role: "visitor",
    });
    console.log("Visitor user created");

    // Add createdBy to courses and save
    for (let courseData of sampleCourses) {
      courseData.createdBy = editorUser._id;
      await Course.create(courseData);
    }
    console.log("Sample courses created");

    console.log("Database seeded successfully!");
    console.log("\nTest Credentials:");
    console.log("Admin - admin@lms.io / admin123");
    console.log("Editor - editor@lms.io / editor123");
    console.log("Visitor - visitor@lms.io / visitor123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
