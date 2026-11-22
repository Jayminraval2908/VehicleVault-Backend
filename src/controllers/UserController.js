const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const mailSend = require("../utills/MailUtil");
const validatePassword = require("../utills/passwordValidator");

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const ALLOWED_ROLES = ["buyer", "seller"];
const PHONE_REGEX = /^[0-9]{10}$/;

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const sanitizeUser = (user) => {
  const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

const serverError = (res, message, err) => {
  console.error(message, err);
  res.status(500).json({
    message,
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
};

const buildWelcomeHtml = (firstName, via) => `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:30px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:24px;">Vehicle Vault 🚗</h1>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Your account is ready to go</p>
    </div>
    <div style="padding:30px;color:#333;">
      <h2 style="margin-top:0;font-size:20px;">Welcome, ${firstName}! 👋</h2>
      <p style="font-size:15px;line-height:1.6;color:#555;">
        ${
          via === "google"
            ? "Your Google account is now connected to <b>Vehicle Vault</b>."
            : "Your <b>Vehicle Vault</b> account has been created."
        }
        You can now explore vehicles, manage listings, and start your journey with us.
      </p>
      <div style="margin:20px 0;padding:15px;background:#f1f8e9;border-left:4px solid #4CAF50;border-radius:8px;">
        <p style="margin:0;font-size:14px;color:#2e7d32;">
          ✔ Secure login enabled<br/>
          ✔ Fast access to dashboard<br/>
          ✔ Personalized experience ready
        </p>
      </div>
      <div style="text-align:center;margin-top:30px;">
        <a href="${getFrontendUrl()}/"
          style="background:linear-gradient(135deg,#4CAF50,#2E7D32);color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;box-shadow:0 5px 15px rgba(76,175,80,0.3);">
          Get Started 🚀
        </a>
      </div>
    </div>
    <div style="background:#fafafa;text-align:center;padding:15px;font-size:12px;color:#888;">
      © ${new Date().getFullYear()} Vehicle Vault. All rights reserved.
    </div>
  </div>
</div>`;

const sendWelcomeEmail = async (user, via) => {
  try {
    await mailSend(
      user.email,
      "Welcome to Vehicle Vault!",
      "Your Vehicle Vault account is ready.",
      buildWelcomeHtml(user.firstName, via)
    );
    await userModel.findByIdAndUpdate(user._id, { isFirstLogin: false });
  } catch (err) {
    console.error("Welcome email failed:", err.message);
  }
};

const googleSignin = async (req, res) => {
  try {
    const { token, role } = req.body;
    const phone = req.body.phone || req.body.contact;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { given_name, family_name, sub: googleId, email_verified } = payload;
    const email = normalizeEmail(payload.email);

    if (!email_verified) {
      return res.status(401).json({ message: "Google email is not verified" });
    }

    let foundUser = await userModel.findOne({ email });

    if (!foundUser) {
      if (!role || !phone) {
        return res
          .status(404)
          .json({ message: "No account found. Please sign up first." });
      }

      const formattedRole = String(role).toLowerCase();

      if (!ALLOWED_ROLES.includes(formattedRole)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (!PHONE_REGEX.test(phone)) {
        return res
          .status(400)
          .json({ message: "Invalid phone number (must be 10 digits)" });
      }

      foundUser = await userModel.create({
        firstName: given_name,
        lastName: family_name || "",
        email,
        role: formattedRole,
        phone,
        isFirstLogin: true,
        password: await bcrypt.hash(
          googleId + crypto.randomBytes(16).toString("hex"),
          10
        ),
      });
    }

    if (foundUser.isFirstLogin) {
      sendWelcomeEmail(foundUser, "google");
    }

    res.status(200).json({
      message: "Google Sign-In Successful",
      token: signToken(foundUser),
      role: foundUser.role,
      user: sanitizeUser(foundUser),
    });
  } catch (error) {
    serverError(res, "Google Authentication failed", error);
  }
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, password, phone, address, role } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!firstName || !lastName || !email || !password || !phone || !role) {
      return res.status(400).json({
        message: "All fields including role and phone are required",
      });
    }

    const formattedRole = String(role).toLowerCase();
    if (!ALLOWED_ROLES.includes(formattedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res
        .status(400)
        .json({ message: "Invalid phone number (must be 10 digits)" });
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "Weak password",
        errors: passwordErrors,
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const savedUser = await userModel.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email,
      password: await bcrypt.hash(password, 10),
      phone,
      address,
      role: formattedRole,
      isFirstLogin: true,
    });

    res.status(201).json({
      message: "User Registered Successfully",
      data: sanitizeUser(savedUser),
    });
  } catch (err) {
    serverError(res, "Error while creating user", err);
  }
};

const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const foundUser = await userModel.findOne({ email });
    const isPasswordMatch = foundUser
      ? await bcrypt.compare(password, foundUser.password)
      : false;

    if (!foundUser || !isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (foundUser.isFirstLogin) {
      sendWelcomeEmail(foundUser, "manual");
    }

    res.status(200).json({
      message: "Login successful",
      token: signToken(foundUser),
      role: foundUser.role,
      user: sanitizeUser(foundUser),
    });
  } catch (error) {
    serverError(res, "Error while logging in", error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const users = await userModel
      .find()
      .select("-password -resetPasswordToken -resetPasswordExpire");

    res
      .status(200)
      .json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    serverError(res, "Error fetching users", error);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", data: sanitizeUser(deletedUser) });
  } catch (error) {
    serverError(res, "Error deleting user", error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: "Email is not provided" });
    }

    const genericResponse = {
      message: "If this email is registered, a reset link has been sent",
    };

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const url = `${getFrontendUrl()}/resetpassword/${resetToken}`;
    const html = `
      <p>Click the link below to reset your password. It expires in 10 minutes.</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you did not request this, ignore this email.</p>`;

    await mailSend(
      user.email,
      "Reset Password Link",
      `Reset your password: ${url}`,
      html
    );

    res.status(200).json(genericResponse);
  } catch (err) {
    serverError(res, "Error while sending reset link", err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: "Weak password",
        errors: passwordErrors,
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    serverError(res, "Server error", err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleSignin,
  getAllUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
};