const bcrypt = require("bcryptjs");

// 🔐 Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10); // explicit salt
  return await bcrypt.hash(password, salt);
};

// 🔍 Compare password
const comparePassword = async (enteredPassword, storedPassword) => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

module.exports = { hashPassword, comparePassword };