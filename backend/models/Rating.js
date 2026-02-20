const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // ✅ correct import

const Rating = sequelize.define(
  "Rating",
  {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Rating must be at least 1",
        },
        max: {
          args: [5],
          msg: "Rating must be at most 5",
        },
        isInt: {
          msg: "Rating must be an integer",
        },
      },
    },

    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "UserId is required",
        },
      },
    },

    StoreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "StoreId is required",
        },
      },
    },
  },
  {
    timestamps: true,
    tableName: "Ratings",

    indexes: [
      {
        unique: true,
        fields: ["UserId", "StoreId"], // ✅ prevent duplicate rating
      },
    ],

    // 🔥 improves query performance
    defaultScope: {
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    },
  }
);

/* ================= HOOK ================= */
Rating.beforeValidate((instance) => {
  if (instance.rating < 1 || instance.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
});

/* ================= NOTE ================= */
// ❌ DO NOT DEFINE RELATIONS HERE
// Relations must be defined ONLY in models/index.js

module.exports = Rating;