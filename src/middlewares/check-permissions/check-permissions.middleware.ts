import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from "express";

@Injectable()
export class CheckPermissionsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    switch (req.method) {
      case "GET":
        if (!req.decoded.is_admin) return next();
        return res.status(403).json({ msg: "Only regular users can access this endpoint." });
      case "POST":
      case "PUT":
      case "DELETE":
        if (req.decoded.is_admin) return next();
        return res.status(403).json({ msg: "Only admin users can access this endpoint." });
    }
    next();
  }
}
