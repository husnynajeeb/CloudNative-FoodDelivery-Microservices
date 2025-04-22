import Customer from "../models/Customer.js";
import Restaurant from "../models/Restaurant.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerCustomer = async (req, res) => {
  try {
    const { name, phone, address, email, password} = req.body;
    const role = "customer";

    const exists = await Customer.findOne({ phone });
    if (exists)
      return res.status(409).json({ message: "User already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({ name, phone, address, email, password: hashedPassword, role });
    await customer.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerRestaurant = async (req, res) => {
  try {
    const { businessName, address, phone, email, password} = req.body;
    const role = "restaurant";

    const exists = await Restaurant.findOne({ businessName });
    if (exists)
      return res.status(409).json({ message: "User already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const restaurant = new Restaurant({ businessName, address, phone, email, password: hashedPassword, role });
    await restaurant.save();

    res.status(201).json({ message: "Restaurant registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password} = req.body;
    const role = "admin";

    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "User already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({ name, email, password: hashedPassword, role });
    await admin.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { phone, businessName, email, password } = req.body;

  let user = null;

  // Try to login using phone (for customer)
  if (phone) {
    user = await Customer.findOne({ phone });
  }

  // Try restaurant login using businessName
  if (!user && businessName) {
    user = await Restaurant.findOne({ businessName });
  }

  if (!user && email) {
    user = await Admin.findOne({ email });
  }

  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
};

export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select('-password');
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};