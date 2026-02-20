const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const { Op, fn, col } = require("sequelize");

const User = require("../models/User");
const Store = require("../models/Store");
const Rating = require("../models/Rating");

const { createUser } = require("../controllers/adminController");

router.use(authenticate, authorize("admin"));

/* ================= DASHBOARD ================= */
router.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({
      success: true,
      data: { totalUsers, totalStores, totalRatings }
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================= CREATE USER ================= */
router.post("/users", createUser);

/* ================= CREATE STORE ================= */
router.post("/stores", async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address || !ownerId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const store = await Store.create({ name, email, address, ownerId });

    res.json({
      success: true,
      data: store
    });

  } catch (err) {
    console.error("CREATE STORE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================= LIST USERS ================= */
router.get("/users", async (req, res) => {
  try {
    const { q, role, sort = "name:asc", page = 1, limit = 5 } = req.query;

    const where = {};

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } }
      ];
    }

    if (role) where.role = role;

    const allowedFields = ["name", "email", "address", "role"];
    const [field, direction] = sort.split(":");

    const sortField = allowedFields.includes(field) ? field : "name";
    const sortDirection = direction === "desc" ? "DESC" : "ASC";

    const parsedLimit = parseInt(limit);
    const offset = (parseInt(page) - 1) * parsedLimit;

    const users = await User.findAndCountAll({
      where,
      order: [[sortField, sortDirection]],
      limit: parsedLimit,
      offset,
      attributes: ["id", "name", "email", "address", "role"]
    });

    res.json({
      success: true,
      total: users.count,
      page: parseInt(page),
      totalPages: Math.ceil(users.count / parsedLimit),
      data: users.rows
    });

  } catch (err) {
    console.error("USERS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================= USER DETAIL ================= */
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "address", "role"],
      include: [
        {
          model: Store,
          include: [{ model: Rating, attributes: ["rating"] }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (err) {
    console.error("USER DETAIL ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================= LIST STORES (🔥 FINAL FIX) ================= */
router.get("/stores", async (req, res) => {
  try {
    const { sort = "name:asc", q } = req.query;

    const where = {};

    if (q) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { address: { [Op.iLike]: `%${q}%` } }
      ];
    }

    const allowedFields = ["name", "email", "address"];
    const [field, direction] = sort.split(":");

    const sortField = allowedFields.includes(field) ? field : "name";
    const sortDirection = direction === "desc" ? "DESC" : "ASC";

    const stores = await Store.findAll({
      where,

      include: [
        {
          model: Rating,
          attributes: []
        }
      ],

      attributes: [
        "id",
        "name",
        "email",
        "address",
        [fn("COALESCE", fn("AVG", col("Ratings.rating")), 0), "avgRating"]
      ],

      group: ["Store.id"],
      order: [[sortField, sortDirection]]
    });

    res.json({
      success: true,
      data: stores
    });

  } catch (err) {
    console.error("🔥 ADMIN STORE ERROR:", err); // VERY IMPORTANT
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;