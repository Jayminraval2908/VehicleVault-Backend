const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const mailSend = require("../utills/MailUtil");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require('google-auth-library');
const crypto = require("crypto");

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);



const googleSignin = async (req, res) => {
  try {

    const { token, role, contact } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "Google token is required"
      })
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub: googleId } = payload;

    let foundUser = await userModel.findOne({ email });




    if (!foundUser) {
      // NEW USER LOGIC
      if (!role || !contact) {
        return res.status(400).json({
          message: "Role and Contact are required for first-time Google signup"
        });
      }

      foundUser = await userModel.create({
        firstName: given_name,
        lastName: family_name,
        email: email,
        role: role.toLowerCase(),
        phone: contact,
        isFirstLogin: true,
        password: await bcrypt.hash(googleId + Math.random(), 10)
      })
    }

    if (foundUser.isFirstLogin) {
      const htmlTemplate = `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:30px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:24px;">Vehicle Vault 🚗</h1>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Your account is ready to go</p>
    </div>

    <!-- Body -->
    <div style="padding:30px;color:#333;">
      
      <h2 style="margin-top:0;font-size:20px;">
        Welcome, ${foundUser.firstName}! 👋
      </h2>

      <p style="font-size:15px;line-height:1.6;color:#555;">
        Great news! Your Google account has been successfully connected to <b>Vehicle Vault</b>.
        You can now explore vehicles, manage listings, and start your journey with us.
      </p>

      <!-- Feature Box -->
      <div style="margin:20px 0;padding:15px;background:#f1f8e9;border-left:4px solid #4CAF50;border-radius:8px;">
        <p style="margin:0;font-size:14px;color:#2e7d32;">
          ✔ Secure login enabled<br/>
          ✔ Fast access to dashboard<br/>
          ✔ Personalized experience ready
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-top:30px;">
        <a href="http://localhost:5173/"
          style="background:linear-gradient(135deg,#4CAF50,#2E7D32);
                 color:#fff;
                 padding:12px 28px;
                 text-decoration:none;
                 border-radius:8px;
                 font-weight:bold;
                 display:inline-block;
                 box-shadow:0 5px 15px rgba(76,175,80,0.3);">
          Get Started 🚀
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#fafafa;text-align:center;padding:15px;font-size:12px;color:#888;">
      © ${new Date().getFullYear()} Vehicle Vault. All rights reserved.
    </div>

  </div>
</div>
`;

      mailSend(foundUser.email, "Welcome to Vehicle Vault!", "", htmlTemplate);

      await userModel.findByIdAndUpdate(foundUser._id, {
        isFirstLogin: false
      });


    }

    const jwtToken = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userResponse = foundUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Google Sign-In Successful",
      token: jwtToken,
      role: foundUser.role,
      user: userResponse
    });

  } catch (error) {
    console.error("Google signin error :", error)
    res.status(500).json({
      message: "Google Authentication failed",
      error: error.message
    })
  }
}

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, role } = req.body;

    // 🔍 DEBUG (remove later)
    console.log("REQ BODY:", req.body);

    // ❌ 1. REQUIRED FIELD VALIDATION
    if (!firstName || !lastName || !email || !password || !phone || !role) {
      return res.status(400).json({
        message: "All fields including role and phone are required"
      });
    }

    // ❌ 2. PHONE VALIDATION (10 digit)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number (must be 10 digits)"
      });
    }

    // ❌ 3. PASSWORD VALIDATION
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // ❌ 4. CHECK EXISTING USER
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    // 🔐 5. HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 6. CREATE USER
    const savedUser = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      address,
      role: role.toLowerCase(), // ensure consistency
      isFirstLogin: true
    });

    // ✅ 7. SUCCESS RESPONSE
    res.status(201).json({
      message: "User Registered Successfully",
      data: savedUser
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Error while creating user",
      error: err.message
    });
  }
};

// --- REST OF YOUR CODE (Unchanged) ---
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await userModel.findOne({ email });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (foundUser.isFirstLogin) {
      const htmlTemplate = `
<div style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:30px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:24px;">Vehicle Vault 🚗</h1>
      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Your account is ready to go</p>
    </div>

    <!-- Body -->
    <div style="padding:30px;color:#333;">
      
      <h2 style="margin-top:0;font-size:20px;">
        Welcome, ${foundUser.firstName}! 👋
      </h2>

      <p style="font-size:15px;line-height:1.6;color:#555;">
        Great news! Your Google account has been successfully connected to <b>Vehicle Vault</b>.
        You can now explore vehicles, manage listings, and start your journey with us.
      </p>

      <!-- Feature Box -->
      <div style="margin:20px 0;padding:15px;background:#f1f8e9;border-left:4px solid #4CAF50;border-radius:8px;">
        <p style="margin:0;font-size:14px;color:#2e7d32;">
          ✔ Secure login enabled<br/>
          ✔ Fast access to dashboard<br/>
          ✔ Personalized experience ready
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align:center;margin-top:30px;">
        <a href="http://localhost:5173/"
          style="background:linear-gradient(135deg,#4CAF50,#2E7D32);
                 color:#fff;
                 padding:12px 28px;
                 text-decoration:none;
                 border-radius:8px;
                 font-weight:bold;
                 display:inline-block;
                 box-shadow:0 5px 15px rgba(76,175,80,0.3);">
          Get Started 🚀
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#fafafa;text-align:center;padding:15px;font-size:12px;color:#888;">
      © ${new Date().getFullYear()} Vehicle Vault. All rights reserved.
    </div>

  </div>
</div>
`;
      mailSend(foundUser.email, "Welcome to Vehicle Vault!", "Click Get Started to begin.", htmlTemplate);
      await userModel.findByIdAndUpdate(foundUser._id, { isFirstLogin: false });
    }

    const token = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const userResponse = foundUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      token: token,
      role: foundUser.role,
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({ message: "Error while logging in", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    const users = await userModel.find();
    res.status(200).json({ message: "Users fetched successfully", data: users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" })
    }
    res.status(200).json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};





const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is not provided",
    });
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "User not found...",
    });
  }

  // ✅ Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // ✅ Hash token (store hashed version in DB)
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  const url = `http://localhost:5173/resetpassword/${resetToken}`;

  const mailText = `
    <html>
      <p>Click below to reset your password:</p>
      <a href="${url}">RESET PASSWORD</a>
    </html>
  `;

  await mailSend(user.email, "Reset Password Link", mailText);

  res.status(200).json({
    message: "Reset link has been sent to your mail",
  });
};




const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.params;

  if (!newPassword) {
    return res.status(400).json({
      message: "New password is required",
    });
  }

  try {
    // ✅ Hash token from URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // ✅ Find user with valid token
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    // ✅ Hash new password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;

    // ✅ Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
      err: err.message,
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  googleSignin,
  getAllUsers,
  deleteUser,
  forgotPassword,
  resetPassword
};