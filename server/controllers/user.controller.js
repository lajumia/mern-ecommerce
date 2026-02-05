import bcrypt from "bcrypt"
import UserModel from "../models/user.model.js"
import { sendOtpEmail } from "../utils/sendEmail.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";

export async function registerUserController(req,res){
    try{
        const {name , email, password} = req.body
        if(!name || !email || !password){
            return res.status(400).json({
                status: false,
                message: "Please fill all the fields"
            })
        }

        const user = await UserModel.findOne({email})
        if(user) return res.status(400).json({
            status: false,
            message: "User already exists"
        })

        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            emailOtp:generatedOTP,
            emailOtpExpiry:otpExpiry
        })
        const save = await newUser.save()
        const sendOtp =     await sendOtpEmail(email, generatedOTP);

        if(save && sendOtp){
             return res.status(200).json({
                status: true,
                message: "User registered successfully, OTP sent to your email",
                data:{
                    userId:save._id
                }
            })
        }


    }catch(error){
        console.error("Error in registerUserController ", error.message)
        res.status(500).json({
            status: false,
            message: error.message
        })
    }

} 

export async function getUserController(req, res) {
  try {
    // Fetch all users from the database
    const users = await UserModel.find()
      .select("-password -refreshToken") // exclude sensitive fields
      .sort({ createdAt: -1 }); // optional: latest users first

    // Check if users exist
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No users found",
        data: [],
      });
    }

    // Return users
    res.status(200).json({
      status: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error in getUserController:", error.message);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
}

export async function verifyEmailOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user)
      return res.status(404).json({ status:false, message: "User not found" });

    if (user.emailVerified)
      return res.status(400).json({ status:false,  message: "Already verified" });

    if (user.emailOtp !== Number(otp) ){
        return res.status(400).json({ status:false, message: "Invalid OTP" });
    }
    if(user.emailOtpExpiry < Date.now()) {
      return res.status(400).json({ status:false, message: "expired OTP" });
    }

    user.emailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;

    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("Error in verifyEmailOtp", error.message)
    res.status(500).json({ message: "Server error" });
  }
}

export async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please provide both email and password",
      });
    }

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: false,
        message: "Invalid password",
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({
        status: false,
        message: "Please verify your email before logging in",
      });
    }

    // check if status is active
    if(user.status !== "active") {
      return res.status(400).json({
        status: false,
        message: "Your account is not active. Please contact support.",
      });
    }

    

    const accessToken = await generateAccessToken(user._id);
    const refreshToken = await generateRefreshToken(user._id);

    const updateUser = await UserModel.findByIdAndUpdate(user._id, 
      { 
        $set: {
          refreshToken: refreshToken,
          lastLoginAt: new Date()

        }
      },
      { new: true })

    const cookiesOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None"

    }

      res.cookie("accessToken", accessToken, cookiesOptions)
      res.cookie("refreshToken", refreshToken, cookiesOptions)

    // If everything is valid
    res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        accessToken:accessToken,
        refreshToken:refreshToken
      },
    });
  } catch (error) {
    console.error("Error in loginUserController", error.message)
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
}

export async function logoutUserController(req, res) {
  try {
    // 1️⃣ Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        status: false,
        message: "No refresh token found",
      });
    }

    // 2️⃣ Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      return res.status(401).json({
        status: false,
        message: "Invalid refresh token",
      });
    }

    // 3️⃣ Find user
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // 4️⃣ Remove refresh token from DB
    user.refreshToken = null;
    await user.save();

    // 5️⃣ Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
    });

    return res.status(200).json({
      status: true,
      message: "User logged out successfully",
    });

  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
}

export async function generateNewAccessToken(req, res) {
  try {
    // 1️⃣ Get refresh token
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        status: false,
        message: "Refresh token required",
      });
    }

    // 2️⃣ Verify refresh token (CRITICAL)
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // 3️⃣ Find user and match token
    const user = await UserModel.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: false,
        message: "Invalid refresh token",
      });
    }

    // 4️⃣ Generate new access token
    const accessToken = await generateAccessToken(user._id);

    // 5️⃣ Send new access token
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "Lax",
        maxAge: 5 * 60 * 1000, // 5 minutes
      })
      .status(200)
      .json({
        status: true,
        message: "New access token generated",
        accessToken:accessToken
      });

  } catch (error) {
    console.error("generateNewAccessToken error:", error.message);

    return res.status(401).json({
      status: false,
      message: "Refresh token expired or invalid",
    });
  }
}


