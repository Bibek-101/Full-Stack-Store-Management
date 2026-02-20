const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const { Op, fn, col, literal } = require("sequelize");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Store = require("../models/Store");
const Rating = require("../models/Rating");

/* ================= MIDDLEWARE ================= */
router.use(authenticate, authorize("user"));

/*
=====================================
GET ALL STORES
=====================================
*/
router.get("/stores", async (req, res) => {
  try {
    const { q } = req.query;
    const userId = Number(req.user.id);

    const where = {};

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const stores = await Store.findAll({
      where,
      include: [{ model: Rating, attributes: [] }],
      attributes: {
        include: [
          [fn("AVG", col("Ratings.rating")), "avgRating"],
          [
            literal(`(
              SELECT "rating" FROM "Ratings"
              WHERE "Ratings"."StoreId" = "Store"."id"
              AND "Ratings"."UserId" = ${userId}
              LIMIT 1
            )`),
            "myRating"
          ]
        ]
      },
      group: ["Store.id"],
      order: [["name", "ASC"]],
      raw: true // 🔥 IMPORTANT FIX
    });

    const result = stores.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      avgRating: s.avgRating ? Number(s.avgRating).toFixed(1) : null,
      myRating: s.myRating ? Number(s.myRating) : null
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("🔥 USER STORE ERROR FULL:", error);

    res.status(500).json({
      success: false,
      message: error.message // 🔥 SHOW REAL ERROR
    });
  }
});

/*
=========================
SUBMIT / UPDATE RATING
=========================
*/
router.post("/rate/:id", async (req, res) => {
  try {
    const { rating } = req.body;
    const storeId = Number(req.params.id);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found"
      });
    }

    await Rating.upsert({
      UserId: req.user.id,
      StoreId: storeId,
      rating
    });

    res.json({
      success: true,
      message: "Rating submitted successfully"
    });

  } catch (error) {
    console.error("🔥 RATING ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/*
=========================
CHANGE PASSWORD
=========================
*/
router.put("/change-password", async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password is required"
      });
    }

    if (
      !newPassword ||
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

    const user = await User.scope("withPassword").findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password incorrect"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await User.update(
      { password: hashed },
      { where: { id: req.user.id } }
    );

    res.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("🔥 PASSWORD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;