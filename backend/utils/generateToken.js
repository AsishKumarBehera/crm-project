const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    { 
      _id: user._id, 
      tokenVersion: user.tokenVersion,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = generateToken;