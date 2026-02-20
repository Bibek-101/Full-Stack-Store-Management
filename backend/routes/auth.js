const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { signupSchema } = require("../validations/authValidation");
const { authenticate } = require("../middleware/auth");

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    const { name, email, password, address } = req.body;

    // ✅ check duplicate
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // 🔥 DO NOT HASH HERE (model will hash)
    const user = await User.create({
      name,
      email,
      password,
      address,
      role: "user"
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      token,
      role: user.role
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 include password
    const user = await User.scope("withPassword").findOne({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      token,
      role: user.role
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


/* ================= CHANGE PASSWORD ================= */
router.put("/change-password", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 🔥 include password
    const user = await User.scope("withPassword").findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect"
      });
    }

    // ✅ validation
    if (
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[!@#$%^&*]/.test(newPassword)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8–16 chars, include uppercase & special character"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // 🔥 DO NOT HASH HERE (model hook will hash)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;