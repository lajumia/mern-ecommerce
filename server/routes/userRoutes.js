import express from "express"

import { registerUserController, getUserController, verifyEmailOtp } from "../controllers/user.controller.js";

const route =  express.Router();

route.post("/register", registerUserController)
route.get("/users", getUserController)
route.post("/verify-email", verifyEmailOtp) 

export default route;