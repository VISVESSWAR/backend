import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  title: String,
  price: Number,
  image: String,
  createdBy: String,
  duration: Number,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    cart: [courseSchema],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
