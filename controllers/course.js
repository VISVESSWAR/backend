import { tryCatch } from "../middlewares/tryCatch.js";
import { Courses } from "../models/Course.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";

export const getAllCourses = tryCatch(async (req, res) => {
  const allCourses = await Courses.find();
  res.status(200).json({ message: "Courses fetched", allCourses });
});

export const getSingleCourse = tryCatch(async (req, res) => {
  const singleCourse = await Courses.findById(req.params.id);
  res.status(200).json({ message: "Course fetched", singleCourse });
});

export const fetchAllLectures = tryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });
  const user = await User.findById(req.user._id);
  if (user.role === "admin") {
    return res
      .status(200)
      .json({ message: "Fetched All lectures of the course ", lectures });
  }
  if (!user.courses.includes(req.params.id)) {
    return res.status(400).json({ message: "You have not bought this course" });
  }
  res.json({ lectures });
});

export const fetchLecture = tryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  const user = await User.findById(req.user._id);
  // if (user.role !== "admin") {
  //   return res.status(400).json({ message: "You are not an admin." });
  // }
  if (user.role === "admin") {
    return res
      .status(200)
      .json({ message: "Fetched lecture of the course ", lecture });
  }
  if (!user.courses.includes(lecture.course)) {
    return res
      .status(400)
      .json({ message: "You have not enrolled in this course" });
  }
});

export const getMyCourses = tryCatch(async (req, res) => {
  const myCourses = await Courses.find({ _id: req.user.courses });
  res.json({ myCourses });
});
