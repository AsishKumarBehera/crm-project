import Lead from "../models/Lead.js";
import getGreeting from "../utils/greeting.js";

export async function getDashboard (req, res) {
  try {

    const greeting = getGreeting();
    const total = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ stage: "New" });
    const converted = await Lead.countDocuments({ stage: "Closed" });
    const lost = await Lead.countDocuments({ status: "Inactive" });
    
const recentLeads = await Lead.find()
  .sort({ createdAt: -1 })
  .limit(5); 
  const activity = recentLeads.map(lead => ({
  name: lead.name,
  status: lead.stage,   // or lead.status
  time: getTimeAgo(lead.createdAt)
}));
  function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = [
    { label: "year", sec: 31536000 },
    { label: "month", sec: 2592000 },
    { label: "day", sec: 86400 },
    { label: "hour", sec: 3600 },
    { label: "minute", sec: 60 }
  ];

  for (let i of intervals) {
    const count = Math.floor(seconds / i.sec);
    if (count > 0) {
      return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

    res.json({
      message: greeting,
      user:{ name: req.user?.name || "User" },
      total,
      new: newLeads,
      converted,
      lost,
      activity
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};