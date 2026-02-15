const crypto = require("crypto");

const generateResetToken = () => {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token before saving to database
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expiration (10 minutes)
  const resetExpire = Date.now() + 10 * 60 * 1000;

  return { resetToken, hashedToken, resetExpire };
};

module.exports = generateResetToken;
