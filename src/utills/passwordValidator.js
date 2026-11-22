const validatePassword = (password) => {
  if (typeof password !== "string" || !password) {
    return ["Password is required"];
  }

  const errors = [];

  if (password.length < 8) errors.push("At least 8 characters");
  if (password.length > 64) errors.push("Maximum 64 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[^A-Za-z0-9\s]/.test(password)) errors.push("One special character");
  if (/\s/.test(password)) errors.push("No spaces allowed");

  return errors;
};

module.exports = validatePassword;