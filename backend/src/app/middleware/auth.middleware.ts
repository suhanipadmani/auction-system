import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserModel } from "../models/user";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as { id: string; role: string; status: string };

    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ success: false, message: "User no longer exists" });
      return;
    }

    if (user.status === "deleted" || user.status === "inactive") {
      res.status(403).json({ 
        success: false, 
        message: user.status === "deleted" ? "Account has been deleted" : "Account has been deactivated" 
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      status: user.status
    };
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
