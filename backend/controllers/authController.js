import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import generateToken from "../utils/generateToken.js";

// SIGNUP
export async function signup (req, res) {
  try {
    const { name, email, phone, dob, profilePic, password } = req.body;

    // Required validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      phone,
      dob,
      profilePic,
      password: hashedPassword,
    });

    await newUser.save();

    //  Generate token after signup
    const token = generateToken(newUser);

    //  Store in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};



// LOGIN
export async function login (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      $or: [{ email: email }, { phone: email }]
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or phone" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user);

    //  Store token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// logout
export async function logout (req, res) {
  await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};


export const loggedIn = (req, res) => {
  // req.user is set by your auth middleware (verifyToken)
  if (!req.user) {
    return res.status(401).json({ isAuthenticated: false });
  }
  res.status(200).json({ isAuthenticated: true });
};
