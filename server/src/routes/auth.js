import { Router } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post("/login", async (req, res, next) => {
  try {
    const data = await loginSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isValidPassword = await user.verifyPassword(data.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subjects: user.subjects,
        gradeLevels: user.gradeLevels,
        bio: user.bio
      }
    });
  } catch (err) {
    if (err.isJoi) err.status = 400;
    next(err);
  }
});

export default router;

