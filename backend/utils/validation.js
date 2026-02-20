import validator from "validator";

/* ================= PASSWORD RULE ================= */
const isValidPassword = (password) => {
  return (
    password &&
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  );
};

/* ================= SIGNUP VALIDATION ================= */
export const validateUser = (data) => {
  const { name, email, password, address } = data;

  if (!name || name.length < 20 || name.length > 60)
    return "Name must be 20–60 characters";

  if (!email || !validator.isEmail(email))
    return "Invalid email format";

  if (!isValidPassword(password))
    return "Password must be 8–16 chars, include uppercase & special char";

  if (!address || address.length > 400)
    return "Address must be less than 400 characters";

  return null;
};

/* ================= LOGIN VALIDATION ================= */
export const validateLogin = (data) => {
  const { email, password } = data;

  if (!email || !validator.isEmail(email))
    return "Invalid email";

  if (!password) return "Password is required";

  return null;
};

/* ================= CHANGE PASSWORD ================= */
export const validateChangePassword = (data) => {
  const { oldPassword, newPassword, confirmPassword } = data;

  if (!oldPassword) return "Old password is required";

  if (!isValidPassword(newPassword))
    return "New password must be 8–16 chars, include uppercase & special char";

  if (newPassword !== confirmPassword)
    return "Passwords do not match";

  return null;
};