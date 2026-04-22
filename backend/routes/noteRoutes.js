import express from "express";
import { addNote, getNotesByLead, updateNote } from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

// add note
router.post("/addNote/:id", authMiddleware, addNote);

// get notes
router.get("/getNotesByLead/:id", authMiddleware, getNotesByLead);

// update note
router.put("/updateNote/:id", authMiddleware, updateNote);

export default router;