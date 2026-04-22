import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { signup, login, logout, loggedIn } from "../controllers/authController.js";

const router = express.Router();



// routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/loggedIn", authMiddleware, loggedIn);

export default router;