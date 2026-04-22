import jwt from "jsonwebtoken";
import User from "../models/User.js";



const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: "Session expired, please login again" });
    }

    req.user = decoded;
    next();

  } catch (error) {
    console.log('❌ Auth error:', error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;