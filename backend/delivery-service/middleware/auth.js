import jwt from 'jsonwebtoken';
import { verifyDriver } from "../controllers/deliveryController.js";

const protect = async (req, res, next) => {

  try {
    // 🔥 ADD: Check for internal-call shortcut
    if (req.headers['internal-call'] === 'true') {
      console.log('🛡️ Skipping auth for internal internal-call');
      req.user = { role: 'internal' }; // You can set a fake user if needed
      return next();
    }


    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        message: "Not authorized to access this route",
      });
    }

    // Get token from header
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    try {
      const response = await verifyDriver(user.id)
      // Set user info in request object
      console.log(response);
      req.user = response;
      next();
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json({
          status: error.response.status,
          message: error.response.data.message || "Authentication failed",
        });
      }

      return res.status(401).json({
        status: 401,
        message: "Authentication failed: " + error.message,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

/**
 * Middleware to restrict access based on user role
 * @param {string[]} roles - Array of allowed roles
 */

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

export { protect , authorize}