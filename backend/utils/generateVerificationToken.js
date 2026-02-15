const crypto = require("crypto");

const generateVerificationToken = () => {
  // Generate a random token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Hash token before saving to database
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expiration (24 hours)
  const verificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return { verificationToken, hashedToken, verificationExpire };
};

module.exports = generateVerificationToken;
