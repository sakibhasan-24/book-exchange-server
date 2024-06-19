import User from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
export const signUpUser = async (req, res) => {
  console.log(req.body);
  const { userName, userEmail, userPassword, profilePicture, isAdmin } =
    req.body;
  if (!userName || !userEmail || !userPassword) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  // Check if user already exists
  //   console.log(userEmail);
  const userExists = await User.findOne({ userEmail });
  console.log("e", userExists);
  if (userExists) {
    return res
      .status(400)
      .json({ message: "User already exists", success: false });
  }

  // Create new user
  //   hashed password
  const hashedPassword = bcryptjs.hashSync(userPassword, 8);

  const profileImage = profilePicture || User.schema.paths.image.default();
  //   save db
  const newUser = new User({
    userEmail,
    userName,
    password: hashedPassword,
    profileImage,
    isAdmin,
  });
  //   console.log(newUser);
  try {
    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully", success: true, newUser });
  } catch (error) {
    console.log("from", error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  try {
    const validUser = await User.find({ email });
    if (!validUser) {
      return res
        .status(400)
        .json({ message: "No User Exists", success: false });
    }

    const matchPassword = bcryptjs.compareSync(password, validUser.password);
    if (!matchPassword) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const token = jwt.sign(
      {
        id: validUser._id,
        email: validUser.email,
      },
      process.env.JWT_SECRET
    );
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        message: "User signed in successfully",
        success: true,
        user: validUser,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};
