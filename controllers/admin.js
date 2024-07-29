import { tryCatch } from "../middlewares/tryCatch.js";
import { Courses } from "../models/Course.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { rm, unlink } from "fs";
import { promisify } from "util";
import fs from "fs";
export const createCourse = tryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price } = req.body;
  const image = req.file;

  await Courses.create({
    title: title,
    description: description,
    category: category,
    createdBy: createdBy,
    duration: duration,
    price: price,
    image: image?.path,
  });

  res.status(200).json({ message: "course added successfully" });
});

export const addLecture = tryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  if (!course) {
    return res.status(403).json({ message: "course not found" });
  }
  const { title, description } = req.body;

  const file = req.file;
  const lecture = await Lecture.create({
    title,
    description,
    video: file?.path,
    course: course._id,
  });
  res.status(200).json({ message: "Lecture added successfully", lecture });
});

export const deleteLecture = tryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("video deleted");
  });
  await Lecture.deleteOne({ _id: lecture._id });
  return res
    .status(200)
    .json({ message: "deleted lecture successfully from the course" });
});
const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = tryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  const lectures = await Lecture.find({ course: course._id });
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await Lecture.find({ course: course._id }).deleteMany();
  await Courses.deleteOne({ _id: course._id });

  await User.updateMany({}, { $pull: { courses: req.params.id } });
  res.status(200).json({ message: "Course deleted" });
});

export const getAllStats = tryCatch(async (req, res) => {
  const courses = (await Courses.find()).length;
  const lectures = (await Lecture.find()).length;
  const users = (await User.find()).length;
  const stats = {
    courses,
    lectures,
    users,
  };
  res.json({ stats });
});

export const getAllUsers = tryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );
  res.json({ users });
});

export const updateRole = tryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user.role === "user") {
    user.role = "admin";
    await user.save();
    return res.status(200).json({ message: "Role updated to admin" });
  }
  if (user.role === "admin") {
    user.role = "user";
    await user.save();
    return res.status(200).json({ message: "Role updated to user" });
  }
});
