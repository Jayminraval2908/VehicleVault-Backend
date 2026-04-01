const userModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const mailSend = require("../utills/MailUtil");
const jwt = require("jsonwebtoken");
const axios = require("axios"); 
const { OAuth2Client } = require('google-auth-library');
const crypto = require("crypto");

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);



const googleSignin = async(req,res)=>{
    try {

        const {token , role} = req.body;

        if (!token) {
            return res.status(400).json({
                message:"Google token is required"
            })
        }

        const ticket = await client.verifyIdToken({
            idToken:token,
            audience:process.env.VITE_GOOGLE_CLIENT_ID,
        });

        const payload= ticket.getPayload();
        const {email, given_name, family_name, sub:googleId} = payload;

        let foundUser = await userModel.findOne({ email });

        if (!foundUser) {
            if (!role) {
                return res.status(400).json({
                    message:"Role is required for first-time Google signup"
                })
            }

            foundUser = await userModel.create({
                firstName:given_name,
                lastName:family_name,
                email:email,
                role:role.toLowerCase(),
                isFirstLogin:true,
                password:await bcrypt.hash(googleId+Math.random(),10)
            })
        }

        if (foundUser.isFirstLogin) {
            const htmlTemplate = `
                <div style="font-family: Arial, sans-serif; padding:20px;">
                    <h2>Welcome to Vehicle Vault, ${foundUser.firstName}! 🚗</h2>
                    <p>Your Google account is successfully connected.</p>
                    <a href="http://localhost:5173/" 
                        style="display:inline-block; padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
                        Get Started
                    </a>
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
            message:"Google Authentication failed",
            error:error.message
        })
    }
}

// --- UPDATED: Manual Registration (Now supports roles) ---
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, address, role } = req.body;
        
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User Already Exist!!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const savedUser = await userModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            address,
            role: role || "buyer", // Use the role from frontend or default to buyer
            isFirstLogin: true 
        });

        res.status(201).json({
            message: "User Registered Successfully",
            data: savedUser
        });

    } catch (err) {
        res.status(500).json({ message: "Error while creating user", error: err.message });
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
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px;">
                    <h2 style="color: #4CAF50;">Welcome to Vehicle Vault, ${foundUser.firstName}!</h2>
                    <p>We're excited to have you on board for your first session.</p>
                    <a href="http://localhost:5173/" 
                        style="display:inline-block; padding:12px 25px; margin: 15px 0; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">
                        Get Started
                    </a>
                    <p>Happy Driving! 🚗</p>
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
      return res.status(403).json({ message:"Access Denied" });
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
      return res.status(403).json({ message:"Access Denied" });
    }
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message:"User not found" })
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