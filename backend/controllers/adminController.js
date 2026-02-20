import bcrypt from "bcryptjs";
import { validateUser } from "../utils/validation.js";
import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    /* ================= VALIDATION ================= */
    const error = validateUser({ name, email, password, address });

    if (error) {
      return res.status(400).json({ message: error });
    }

    /* ================= ROLE VALIDATION ================= */
    const allowedRoles = ["admin", "user", "store_owner"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    /* ================= EMAIL CHECK ================= */
    const existing = await User.findOne({ where: { email } });

    if (existing) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    /* ================= PASSWORD HASH ================= */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* ================= CREATE USER ================= */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role
    });

    /* ================= RESPONSE ================= */
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
};