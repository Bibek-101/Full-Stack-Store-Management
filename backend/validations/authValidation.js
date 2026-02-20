const Joi = require("joi");

/* ================= PASSWORD RULE ================= */
const passwordRule = Joi.string()
  .min(8)
  .max(16)
  .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must be at most 16 characters",
    "string.pattern.base":
      "Password must include at least 1 uppercase letter and 1 special character",
    "any.required": "Password is required"
  });

/* ================= SIGNUP ================= */
exports.signupSchema = Joi.object({
  name: Joi.string()
    .min(20)
    .max(60)
    .required()
    .messages({
      "string.min": "Name must be at least 20 characters",
      "string.max": "Name must be at most 60 characters",
      "any.required": "Name is required"
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required"
    }),

  address: Joi.string()
    .max(400)
    .required()
    .messages({
      "string.max": "Address must be less than 400 characters",
      "any.required": "Address is required"
    }),

  password: passwordRule
});

/* ================= LOGIN ================= */
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/* ================= CHANGE PASSWORD ================= */
exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),

  newPassword: passwordRule,

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match"
    })
});