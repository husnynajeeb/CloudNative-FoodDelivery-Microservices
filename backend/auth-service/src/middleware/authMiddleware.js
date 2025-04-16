import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};
export const customerOnly = (req, res, next) => {
  if (req.user.role !== 'customer') return res.status(403).json({ message: 'Access denied' });
  next();
};
export const restaurantOnly = (req, res, next) => {
  if (req.user.role !== 'restaurant') return res.status(403).json({ message: 'Access denied' });
  next();
};
// Middleware to ensure access is limited to delivery drivers only
export const deliveryOnly = (req, res, next) => {
  if (req.user.role !== 'delivery') return res.status(403).json({ message: 'Access denied' });
  next();
};