const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [20, 60],
          msg: "Name must be between 20 and 60 characters",
        },
        notEmpty: {
          msg: "Name is required",
        },
      },
      set(value) {
        if (value) this.setDataValue("name", value.trim());
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Email already exists",
      },
      validate: {
        isEmail: {
          msg: "Invalid email format",
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

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is required",
        },
      },
    },

    address: {
      type: DataTypes.STRING(400),
      allowNull: true,
      validate: {
        len: {
          args: [0, 400],
          msg: "Address must be max 400 characters",
        },
      },
      set(value) {
        if (value) this.setDataValue("address", value.trim());
      },
    },

    role: {
      type: DataTypes.ENUM("admin", "user", "store_owner"),
      allowNull: false,
      defaultValue: "user",
    },
  },
  {
    timestamps: true,
    tableName: "Users",

    // 🔥 Hide sensitive fields
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },

    // 🔥 Use ONLY when needed (login / change-password)
    scopes: {
      withPassword: {
        attributes: {
          include: ["password"],
        },
      },
    },
  }
);

/* ================= HOOKS ================= */

// 🔥 Auto hash password (VERY IMPORTANT)
const bcrypt = require("bcryptjs");

User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});


module.exports = User;