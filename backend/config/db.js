const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    dialectOptions: {
      ssl: process.env.DB_SSL === "true"
        ? { require: true, rejectUnauthorized: false }
        : false,
    },
  }
);

/* ================= CONNECTION CHECK ================= */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB Connected Successfully");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };