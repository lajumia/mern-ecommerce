import bcrypt from "bcrypt"
import UserModel from "../models/user.model.js"

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

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword
        })
        const save = await newUser.save()
        if(save){
            return res.status(200).json({
                status:true,
                message: "User registered successfully"
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