const jwt = require("jsonwebtoken");

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  // DEMO OTP
  console.log(`OTP for ${email}: 123456`);

  res.json({
    message: "OTP sent successfully",
    demoOtp: "123456" // remove in production
  });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (otp !== "123456") {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  const token = jwt.sign(
    { email, role: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    message: "Login successful",
    token,
    role: "customer"
  });
};
