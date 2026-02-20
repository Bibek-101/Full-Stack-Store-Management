const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // ✅ correct import

const Store = sequelize.define(
  "Store",
  {
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [1, 60],
          msg: "Store name must be 1–60 characters",
        },
        notEmpty: {
          msg: "Store name is required",
        },
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Invalid store email",
        },
        notEmpty: {
          msg: "Email is required",
        },
      },
      set(value) {
        if (value) {
          this.setDataValue("email", value.toLowerCase().trim());
        }
      },
    },

    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        len: {
          args: [1, 400],
          msg: "Address must be max 400 characters",
        },
        notEmpty: {
          msg: "Address is required",
        },
      },
    },

    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Owner ID is required",
        },
        isInt: {
          msg: "Owner ID must be a number",
        },
      },
    },
  },
  {
    timestamps: true,
    tableName: "Stores",

    // 🔥 cleaner API responses
    defaultScope: {
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    },
  }
);

/* ================= HOOKS ================= */

// ✅ Normalize name before save
Store.beforeCreate((store) => {
  if (store.name) {
    store.name = store.name.trim();
  }
});

Store.beforeUpdate((store) => {
  if (store.name) {
    store.name = store.name.trim();
  }
});

/* ================= NOTE ================= */
// ❌ DO NOT DEFINE RELATIONS HERE
// Relations must ONLY be inside models/index.js

module.exports = Store;