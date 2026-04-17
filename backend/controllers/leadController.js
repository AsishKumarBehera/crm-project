const Lead = require("../models/Lead");

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
const STATUS = ['Active', 'Inactive'];

exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, stage, status } = req.body;

    //  Required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, Email and Phone are required" });
    }

    //  Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //  Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    //  Stage validation
    if (stage && !STAGES.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage value" });
    }

    //  Status validation
    if (status && !STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // ← CHECK DUPLICATE EMAIL
    const existing = await Lead.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Lead with email "${email}" already exists.`
      });
    }

    //  Create lead
    const lead = await Lead.create({
      name,
      email: email.toLowerCase(), // ← store lowercase
      phone,
      stage: stage || 'New',
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead
    });

  } catch (error) {
    // ← catches MongoDB unique index duplicate (safety net)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `Lead with this email already exists.`
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// getlead

exports.getLeads = async (req, res) => {
  try {
    const { stage, status, search } = req.query;

    let filter = {};

    //  Filter by stage
    if (stage) {
      filter.stage = stage;
    }

    //  Filter by status
    if (status) {
      filter.status = status;
    }

    //  Search by name/email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leads",
      error: error.message
    });
  }
};