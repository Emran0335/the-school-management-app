import express from "express";

const userRoutes = express.Router();

import {
  login,
  register,
  updateUser,
  deleteUser,
  logoutUser,
  getUserProfile,
  getUsers,
} from "../controllers/user.ts";
import { protect, authorize } from "../middleware/auth.ts";

userRoutes.post(
  "/register",
  protect,
  authorize(["admin", "teacher"]),
  register,
);
userRoutes.post("/login", login);
userRoutes.post("/logout", logoutUser);
userRoutes.get("/profile", protect, getUserProfile);

// teacher should be able to fetch all students
userRoutes.get("/", protect, authorize(["admin", "teacher"]), getUsers);

// update user using either put or patch
userRoutes.put(
  "/update/:id",
  protect,
  authorize(["admin", "teacher"]),
  updateUser,
);

userRoutes.delete(
  "/delete/:id",
  protect,
  authorize(["admin", "teacher"]),
  deleteUser,
);

export default userRoutes;
