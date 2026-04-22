import User from "../models/User.js";

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -tokenVersion");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, dob, profilePic } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, dob, profilePic },
      { new: true, runValidators: true }
    ).select("-password -tokenVersion");

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// getUser

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name"); // only name
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};