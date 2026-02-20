// models/index.js

const { sequelize } = require("../config/db"); // ✅ correct import

const User = require("./User");
const Store = require("./Store");
const Rating = require("./Rating");

/* ================= RELATIONSHIPS ================= */

// USER → STORE
User.hasMany(Store, {
  foreignKey: "ownerId",
  onDelete: "CASCADE"
});

Store.belongsTo(User, {
  as: "owner",
  foreignKey: "ownerId"
});

// USER → RATING
User.hasMany(Rating, {
  foreignKey: "UserId",
  onDelete: "CASCADE"
});

Rating.belongsTo(User, {
  foreignKey: "UserId"
});

// STORE → RATING
Store.hasMany(Rating, {
  foreignKey: "StoreId",
  onDelete: "CASCADE"
});

Rating.belongsTo(Store, {
  foreignKey: "StoreId"
});

/* ================= INIT FUNCTION (🔥 IMPORTANT) ================= */
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connected");

    await sequelize.sync(); // safe for dev
    console.log("✅ Models Synced");

  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
  }
};

/* ================= EXPORT ================= */
module.exports = {
  sequelize,
  User,
  Store,
  Rating,
  initDB // 🔥 NEW
};