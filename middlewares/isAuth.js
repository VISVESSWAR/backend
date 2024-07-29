import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
export const isAuth = async (req, res, next) => {
  try {
    console.log("req.headers:",req.headers);
    const token = req.headers.token;
    console.log(token);

    if (!token) {
      return res.status(400).json({ message: "Please login!" });
    }
    const decodedData = jwt.verify(token, process.env.JWT_code);
    req.user = await User.findById(decodedData._id);
    next();
    
  } catch (err) {
    res.status(500).json({ message: "Login first" });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not eligible to perform this operation" });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

