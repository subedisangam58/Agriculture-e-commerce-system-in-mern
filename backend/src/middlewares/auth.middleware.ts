import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token =
            req.cookies.token ||
            (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.split(' ')[1]
                : null);

        if (!token) {
            res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        (req as any).userId = decoded.id;

        next();
    } catch (err) {
        res.status(403).json({ success: false, message: 'Forbidden: Invalid or expired token' });
    }
};