import { Request, Response, NextFunction } from "express";
import { ApiError, AppRequest } from "../../types";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateUser = (req: AppRequest, res: Response, next: NextFunction) => {
  if (req.path === "/account/login" || req.path === "/account/signup") {
    return next();
  }
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.body.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};

export const errorHandler = (err: ApiError, req: AppRequest, res: Response, next: NextFunction) => {
  console.error("API Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
};

export const errorWrapper =
  (func: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next).catch(next));
  };
