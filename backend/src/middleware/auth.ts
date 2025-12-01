import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import IAdminUser from '../models/AdminUser';

interface AuthenticatedRequest extends Request {
  admin?: IAdminUser;
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    const admin = await IAdminUser.findById(decoded.id);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or inactive admin account.' 
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

export const requirePermission = (permission: keyof IAdminUser['permissions']) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin || !req.admin.hasPermission(permission)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions.' 
      });
    }
    next();
  };
};