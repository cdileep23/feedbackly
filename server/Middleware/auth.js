import jwt from "jsonwebtoken";
import adminModel from "../models/admin.model.js";


export const IsAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Middleware");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await adminModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    req.user =user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid or expired token",
    });
  }
};
