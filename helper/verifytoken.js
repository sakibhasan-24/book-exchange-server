import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  //   console.log(token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "You are not authenticated!", success: false });
  }

  //verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "You are not authenticated!", success: false });
    }

    // console.log(verified);
    req.user = verified;
    next();
  });
};
