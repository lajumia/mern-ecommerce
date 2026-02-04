import bcrypt from "bcrypt"
import UserModel from "../models/user.model.js"
import { sendOtpEmail } from "../utils/sendEmail.js";

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
    res.status(500).json({ message: "Server error" });
  }
}
