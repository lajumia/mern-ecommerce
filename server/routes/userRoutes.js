import express from "express"

import { registerUserController, getUserController } from "../controllers/user.controller.js";

const route =  express.Router();

route.post("/register", registerUserController)
route.get("/users", getUserController)

export default route;