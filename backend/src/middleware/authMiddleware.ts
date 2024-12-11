import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null){
    res.sendStatus(401);
  } else {
    jwt.verify(token, process.env.JWT_SECRET || "nope", (err, decoded) => {
      if (err) res.sendStatus(403);
      (req as any).user = decoded;
      next();
    });
  }
}
