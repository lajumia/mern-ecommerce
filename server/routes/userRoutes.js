import express from "express"

import { registerUserController,
         getUserController, 
         verifyEmailOtp, 
         loginUserController, 
         logoutUserController,
         generateNewAccessToken } from "../controllers/user.controller.js";

         
import { authMiddleware } from "../middlewares/authMiddleware.js";

const route =  express.Router();

route.post("/register", registerUserController)
route.get("/users", getUserController)
route.post("/verify-email", verifyEmailOtp) 
route.post("/login", loginUserController)
route.post("/logout", logoutUserController);
route.post("/access-token",generateNewAccessToken)

export default route;