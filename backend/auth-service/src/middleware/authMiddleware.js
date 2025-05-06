import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('🚫 Token missing or malformed');
    return res.status(401).json({ message: 'Token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Received token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Decoded token:', decoded);

    req.user = decoded; // { _id, role, name, ... }
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
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

