import express from "express";
import {
  loginUser,
  MyProfile,
  register,
  verifyUser,
} from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyUser);
router.post("/login", loginUser);
router.get("/profile", isAuth, MyProfile);
export default router;
