import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

 const generateRefreshToken = async (userId) => {
  const token = await jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "90d" }
  );


  return token
};

export default generateRefreshToken