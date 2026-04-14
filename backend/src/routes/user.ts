import express from "express";

const userRoutes = express.Router();

import { login, register } from "../controllers/user.ts";

userRoutes.post(
  "/register",
  register,
);

userRoutes.post("/login", login)

export default userRoutes;
