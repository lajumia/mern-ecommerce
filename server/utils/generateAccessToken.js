import jwt from "jsonwebtoken";

 const generateAccessToken = async (userId) => {
  const token = await jwt.sign(
    { userId : userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  return token
};

export default generateAccessToken