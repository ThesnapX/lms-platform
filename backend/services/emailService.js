const nodemailer = require("nodemailer");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #84cc16;">Welcome to LMS.io!</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for joining LMS.io. Start exploring courses today!</p>
      <a href="${process.env.CLIENT_URL}/courses" style="display: inline-block; background: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Browse Courses</a>
    </div>
  `;
  await sendEmail(user.email, "Welcome to LMS.io!", html);
};

const sendPurchaseEmail = async (user, course) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #84cc16;">Purchase Confirmed!</h2>
      <p>Hello ${user.name},</p>
      <p>You have successfully enrolled in:</p>
      <h3>${course.title}</h3>
      <a href="${process.env.CLIENT_URL}/courses/${course._id}" style="display: inline-block; background: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Start Learning</a>
    </div>
  `;
  await sendEmail(user.email, "Course Enrollment Confirmed", html);
};

const sendCompletionEmail = async (user, course) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #84cc16;">Congratulations!</h2>
      <p>Hello ${user.name},</p>
      <p>You have completed:</p>
      <h3>${course.title}</h3>
      <p>Keep learning! Check out more courses.</p>
      <a href="${process.env.CLIENT_URL}/courses" style="display: inline-block; background: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Browse More</a>
    </div>
  `;
  await sendEmail(user.email, "Course Completed!", html);
};

const sendPromotionalEmail = async (subject, content) => {
  const users = await User.find({}).select("email");
  const emails = users.map((u) => u.email).join(",");

  await sendEmail(
    emails,
    subject,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">${content}</div>`,
  );
};

module.exports = {
  sendWelcomeEmail,
  sendPurchaseEmail,
  sendCompletionEmail,
  sendPromotionalEmail,
};
