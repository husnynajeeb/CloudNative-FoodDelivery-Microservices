import jwt from 'jsonwebtoken';

export const verifyRestaurant = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'restaurant') {
      return res.status(403).json({ message: 'Access denied. Not a restaurant.' });
    }

    req.user = decoded; // Contains { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};