import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getProfile, updateProfile, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/getProfile", authMiddleware, getProfile);
router.put("/updateProfile", authMiddleware, updateProfile);
router.get("/getUsers", authMiddleware, getUsers);

export default router;