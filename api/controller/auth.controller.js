import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
export const signUpUser = async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res
      .status(400)
      .json({ message: "User already exists", success: false });
  }

  // Create new user
  //   hashed password
  const hashedPassword = bcryptjs.hashSync(password, 8);

  const user = new User({ userName, email, password: hashedPassword });
  try {
    await user.save();
    return res
      .status(201)
      .json({ message: "User created successfully", success: true, user });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
