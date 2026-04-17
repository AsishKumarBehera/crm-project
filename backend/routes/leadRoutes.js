const express = require("express");
const router = express.Router();

const { createLead, getLeads } = require("../controllers/leadController");
const authMiddleware = require("../middleware/authMiddleware");

// routes
router.post("/createlead", authMiddleware, createLead);   
router.get("/getleads", authMiddleware, getLeads);    
   

module.exports = router;