const Lead = require("../models/Lead");

exports.getDashboard = async (req, res) => {
  try {
    const total = await Lead.countDocuments();

    const newLeads = await Lead.countDocuments({ stage: "New" });
    const converted = await Lead.countDocuments({ stage: "Closed" });
    const lost = await Lead.countDocuments({ status: "Inactive" });

    res.json({
      message:"Hii ",
      user:{
      name:req.user.name
      },
      total,
      new: newLeads,
      converted,
      lost
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};