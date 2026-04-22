import express from "express";
import { createLead, getLeads, updateLead, getLeadById } from "../controllers/leadController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

// routes
router.get("/getleads", authMiddleware, getLeads);    
router.post("/createlead", authMiddleware, createLead);
router.put("/updatelead/:id", authMiddleware, updateLead); 

router.get("/getLeadById/:id", authMiddleware, getLeadById);

// router.post("/addNote/:id", authMiddleware, addNote);  
   

export default router;