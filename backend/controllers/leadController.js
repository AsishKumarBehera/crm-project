import mongoose from "mongoose";
import Lead from "../models/Lead.js";

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];
const STATUS = ['Active', 'Inactive'];

// CREATE LEAD
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, stage, status } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, Email and Phone are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    if (stage && !STAGES.includes(stage)) {
      return res.status(400).json({ message: "Invalid stage value" });
    }

    if (status && !STATUS.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const existingLead = await Lead.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingLead) {
      if (existingLead.email === email.toLowerCase()) {
        return res.status(409).json({
          message: "Email already in use"
        });
      }

      if (existingLead.phone === phone) {
        return res.status(409).json({
          message: "Phone already in use"
        });
      }
    }

    const lead = await Lead.create({
      name,
      email: email.toLowerCase(),
      phone,
      stage: stage || 'New',
      status: status || 'Active',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate data found"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// GET LEADS
export const getLeads = async (req, res) => {
  try {
    const { stage, status, search, createdFrom, createdTo, updatedFrom, updatedTo, createdBy, updatedBy } = req.query;
    

    let filter = {};

    //  Stage & Status
    if (stage) filter.stage = stage;
    if (status) filter.status = status;
   if (createdBy) {
  filter.createdBy = new mongoose.Types.ObjectId(String(createdBy));
}
if (updatedBy) {
  filter.updatedBy = new mongoose.Types.ObjectId(String(updatedBy));
}
//  CREATED DATE RANGE
if (createdFrom || createdTo) {
  filter.createdAt = {};

  if (createdFrom) {
    filter.createdAt.$gte = new Date(createdFrom);
  }

  if (createdTo) {
    const end = new Date(createdTo);
    end.setHours(23, 59, 59, 999);
    filter.createdAt.$lte = end;
  }
}

//  UPDATED DATE RANGE
if (updatedFrom || updatedTo) {
  filter.updatedAt = {};

  if (updatedFrom) {
    filter.updatedAt.$gte = new Date(updatedFrom);
  }

  if (updatedTo) {
    const end = new Date(updatedTo);
    end.setHours(23, 59, 59, 999);
    filter.updatedAt.$lte = end;
  }
}
    
    //  Search (IMPORTANT: use $and)
    if (search) {
      filter.$and = [
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ]
        }
      ];
    }

    const leads = await Lead.find(filter)
    .populate('createdBy', 'name')  
    .populate('updatedBy', 'name')
    .sort({ createdAt: -1 });

    console.log(' Leads found:', leads.length);        
    console.log(' Sample lead:', leads[0]); 

    res.json({
      success: true,
      data: leads
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching leads" });
  }
};

// UPDATE LEAD
export const updateLead = async (req, res) => {
  try {

    //  block restricted fields
    if (req.body.email || req.body.phone) {
      return res.status(400).json({
        message: "Email and phone cannot be updated"
      });
    }

    const updates = {};

    //  NAME VALIDATION
    if (req.body.name !== undefined) {
      const name = req.body.name.trim();

      if (!name) {
        return res.status(400).json({
          message: "Name cannot be empty"
        });
      }

      updates.name = name;
    }

    //  STAGE VALIDATION
    const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];

    if (req.body.stage !== undefined) {
      if (!STAGES.includes(req.body.stage)) {
        return res.status(400).json({
          message: "Invalid stage value"
        });
      }

      updates.stage = req.body.stage;
    }

    //  STATUS VALIDATION
    const STATUS = ['Active', 'Inactive', 'Pending'];

    if (req.body.status !== undefined) {
      if (!STATUS.includes(req.body.status)) {
        return res.status(400).json({
          message: "Invalid status value"
        });
      }

      updates.status = req.body.status;
    }
    
        updates.updatedBy = req.user._id;
    //  UPDATE ONLY VALID FIELDS
    const updated = await Lead.findByIdAndUpdate(
      
      req.params.id,
      updates,
      { returnDocument: 'after' }
    );

    res.json({ message: "Updated", lead: updated });

  } catch (err) {
    res.status(500).json({ message: "Error updating" });
  }
};


// getleadId

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    res.status(200).json({
      success: true,
      lead
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching lead",
      error: error.message
    });
  }
};
