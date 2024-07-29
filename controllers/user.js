import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import sendMail from "../middlewares/sendMail.js";
import { tryCatch } from "../middlewares/tryCatch.js";

export const register = tryCatch(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashPassword });

    const otp = Math.floor(Math.random() * 1000000);
    const activationToken = jwt.sign(
      { otp, user },
      process.env.Activation_code,
      { expiresIn: "5m" }
    );

    const data = { name, otp };
    await sendMail(email, "lookSkill", data);

    res
      .status(200)
      .json({ message: "OTP sent to your email", activationToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const verifyUser = tryCatch(async (req, res) => {
  const { otp, activationToken } = req.body;

  const verify = jwt.verify(activationToken, process.env.Activation_code);
  if (!verify) res.status(400).json({ message: "OTP expired!Try again" });
  if (verify.otp !== otp) {
    res.status(400).json({ message: "OTP incorrect!" });
  }
  await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password,
  });
  res.status(200).json({ message: "User registered successfully" });
});

export const loginUser = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  const exists = await User.findOne({ email });
  if (!exists) {
    return res.status(400).json({ message: "no user with this email" });
  }
  const pass = await bcrypt.compare(password, exists.password);
  if (!pass) {
    return res.status(400).json({ message: "Incorrect Password" });
  }
  const token = jwt.sign({ _id: exists._id }, process.env.JWT_code, {
    expiresIn: "15d",
  });
  res
    //.status(200)
    .json({ message: `Welcome back ${exists.name}!`, token, exists });
});

export const MyProfile = tryCatch(async (req, res) => {
  const userData = await User.findById(req.user._id);
  res.json({ userData });
});
