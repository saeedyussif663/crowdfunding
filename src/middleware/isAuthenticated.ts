import { NextFunction, Request, Response } from "express";

export default function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.headers.authorization);
  next();
}
