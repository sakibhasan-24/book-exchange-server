import bcryptjs from "bcryptjs";
import User from "../model/user.model.js";

export const userUpdate = async (req, res) => {
  if (req.user.id !== req.params.userId) {
    return res.status(403).json({
      error: "You can update only your account!",
    });
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }
    req.body.password = bcryptjs.hashSync(req.body.password);
    if (req.body.userName) {
      if (req.body.userName.length < 6 || req.body.userName.length > 25) {
        return res.status(400).json({
          error: "Username must be between 6 and 25 characters long",
        });
      }
      if (!req.body.userName.match(/^[a-zA-Z0-9]+$/)) {
        return res.status(400).json({
          error: "Username can only contain letters and numbers",
        });
      }

      try {
        const updateUser = await User.findByIdAndUpdate(
          req.params.userId,
          {
            userName: req.body.userName,
            password: req.body.password,
            userEmail: req.body.userEmail,
            image: req.body.image,
          },
          { new: true }
        );
        return res.status(200).json({
          message: "User updated successfully",
          success: true,
          user: updateUser,
        });
      } catch (error) {
        return res.status(400).json({
          message: "Wrong",
          success: false,
        });
      }
    }
  }
};
