import express from "express";
import {
  fetchLecture,
  fetchAllLectures,
  getAllCourses,
  getSingleCourse,
  getMyCourses,
} from "../controllers/course.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/lectures/:id", isAuth, fetchAllLectures); //courseID
router.get("/lecture/:id", isAuth, fetchLecture); //lectureID
router.get("/myCourses", isAuth, getMyCourses);
//router.post("/course/checkout/:id", isAuth, checkOut);
//router.post("/verification/:id", isAuth, paymentVerification);

export default router;
