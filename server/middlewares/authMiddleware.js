import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      });
    }

    req.user = user; // 🔥 attach logged-in user
    next();

  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
}
