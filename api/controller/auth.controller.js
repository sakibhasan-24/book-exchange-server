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
    image: profileImage,
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
  console.log("body", req.body);
  const { userEmail, password } = req.body;
  if (!userEmail || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  try {
    const validUser = await User.findOne({ userEmail });

    // console.log("sign", validUser);
    if (!validUser) {
      return res
        .status(400)
        .json({ message: "No User Exists", success: false });
    }

    const matchPassword = bcryptjs.compareSync(password, validUser.password);
    console.log(matchPassword);
    if (!matchPassword) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }
    const token = jwt.sign(
      {
        id: validUser._id,
        userEmail: validUser.userEmail,
        isAdmin: validUser.isAdmin,
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

export const googleSignIn = async (req, res) => {
  const { userName, userEmail, profileImage } = req.body;
  console.log(req.body);
  const alreadyExistUser = await User.findOne({ userEmail });
  if (alreadyExistUser) {
    const token = jwt.sign(
      {
        id: alreadyExistUser._id,
        userEmail: alreadyExistUser.userEmail,
        isAdmin: alreadyExistUser.isAdmin,
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
        success: true,
        message: "user Sign In",
        user: alreadyExistUser,
      });
  } else {
    const randomPassword = Math.random().toFixed(3).slice(-6);
    const hashedPassword = bcryptjs.hashSync(randomPassword, 8);
    const profilePicture = profileImage || User.schema.paths.image.default();
    const newUser = new User({
      userName,
      userEmail,
      password: hashedPassword,
      image: profilePicture,
      isAdmin: true,
    });
    const savedUser = await newUser.save();
    const token = jwt.sign(
      {
        id: savedUser._id,
        userEmail: savedUser.userEmail,
        isAdmin: savedUser.isAdmin,
      },
      process.env.JWT_SECRET
    );
    res
      .status(200)
      .cookie(
        "token",
        token,
        {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        },
        process.env.JWT_SECRET
      )
      .json({
        success: true,
        message: "user Sign In",
        user: savedUser,
      });
  }

  try {
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      success: false,
    });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.status(200).json({
      message: "User signed out successfully",
      success: true,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      success: false,
    });
  }
};
