const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const { fn, col } = require("sequelize");

const Rating = require("../models/Rating");
const User = require("../models/User");
const Store = require("../models/Store");

router.use(authenticate, authorize("store_owner"));

/*
=====================================
STORE OWNER DASHBOARD
=====================================
*/
router.get("/dashboard", async (req, res) => {
  try {
    const { sort = "date:desc" } = req.query;

    // ✅ Find store
    const store = await Store.findOne({
      where: { ownerId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // ✅ Sorting logic
    let order = [["createdAt", "DESC"]];

    if (sort === "date:asc") order = [["createdAt", "ASC"]];
    if (sort === "rating:asc") order = [["rating", "ASC"]];
    if (sort === "rating:desc") order = [["rating", "DESC"]];

    // ✅ Fetch ratings with users
    const ratings = await Rating.findAll({
      where: { StoreId: store.id },
      include: [
        {
          model: User,
          attributes: ["name", "email"]
        }
      ],
      order
    });

    // ✅ DB Aggregation for average
    const avgResult = await Rating.findOne({
      where: { StoreId: store.id },
      attributes: [[fn("AVG", col("rating")), "avg"]],
      raw: true
    });

    const avg = avgResult?.avg ? Number(avgResult.avg).toFixed(1) : "0.0";

    res.json({
      avg,
      totalRatings: ratings.length,
      ratings
    });

  } catch (err) {
    console.error("STORE DASHBOARD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;