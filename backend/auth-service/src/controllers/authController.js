import Customer from "../models/Customer.js";
import Restaurant from "../models/Restaurant.js";
import Admin from "../models/Admin.js";
import Driver from "../models/Driver.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import { geocodeAddress } from '../../geocode.js'; // Assume you put the above function here

export const registerCustomer = async (req, res) => {
  try {
    const { name, phone, email, password} = req.body;
    const role = "customer";

    const exists = await Customer.findOne({ phone });
    if (exists)
      return res.status(409).json({ message: "User already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({ name, phone, email, password: hashedPassword, role });
    await customer.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const registerRestaurant = async (req, res) => {
  try {
    const { businessName, address, phone, email, password } = req.body;
    const role = "restaurant";

    const exists = await Restaurant.findOne({ businessName });
    if (exists)
      return res.status(409).json({ message: "Business name already in use" });

    // Ensure country is always Sri Lanka
    const fullAddress = `${address.street}, ${address.city}, Sri Lanka`;

    // Geocode the address
    const coordinates = await geocodeAddress(fullAddress);

    if (!coordinates) {
      return res.status(400).json({ message: 'Unable to geocode the provided address' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const restaurant = new Restaurant({
      businessName,
      address: {
        ...address,
        country: 'Sri Lanka',
      },
      phone,
      email,
      password: hashedPassword,
      role,
      location: {
        type: 'Point',
        coordinates, // [lng, lat]
      }
    });

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

  // Try to login using phone
  if (phone) {
    user = await Customer.findOne({ phone }) 
        || await Driver.findOne({ phone }) 
        || await Restaurant.findOne({ phone });
  }

  // Try restaurant login using businessName
  if (!user && businessName) {
    user = await Restaurant.findOne({ businessName });
  }

  // Try admin login
  if (!user && email) {
    user = await Admin.findOne({ email });
  }

  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // Prepare user response based on role
  let userResponse;

  if (user.role === 'restaurant') {
    userResponse = {
      id: user._id,
      businessName: user.businessName,
      email: user.email ? user.email.trim() : undefined,
      phone: user.phone,
      address: user.address,
      image: user.image,
      role: user.role,
      location: user.location
    };
  } else if (user.role === 'customer') {
    userResponse = {
      id: user._id,
      name: user.name,
      email: user.email ? user.email.trim() : undefined,
      phone: user.phone,
      address: user.address,
      role: user.role
    };
  } else if (user.role === 'admin') {
    userResponse = {
      id: user._id,
      name: user.name,
      email: user.email ? user.email.trim() : undefined,
      role: user.role
    };
  } else if (user.role === 'delivery') {
    userResponse = {
      id: user._id,
      name: user.name,
      email: user.email ? user.email.trim() : undefined,
      phone: user.phone,
      role: user.role,
      vehicleType: user.vehicleType,
      vehiclePlate: user.vehiclePlate,
      address: user.address,
      profilePicture: user.profilePicture,
      location: user.location
    };
  }

  res.json({
    token,
    user: userResponse
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


export const AllRestaurants = async (req, res) => {
  const data = await Restaurant.find();
  res.json(data);
};


export const getRestaurantById = async (req, res) => {
  const data = await Restaurant.findById(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};



export const registerDriver = async (req, res) => {
  try {
    const { name, phone, email, password, vehicleType, vehiclePlate, address, profilePicture } = req.body;

    const exists = await Driver.findOne({ phone });
    if (exists) return res.status(409).json({ message: "Driver already exists" });

    const fullAddress = `${address.street}, ${address.city}, Sri Lanka`;

    const coordinates = await geocodeAddress(fullAddress);
    if (!coordinates) {
      return res.status(400).json({ message: 'Unable to geocode the provided address' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const driver = new Driver({
      name,
      phone,
      email,
      password: hashedPassword,
      vehicleType,
      vehiclePlate,
      address: {
        ...address,
        country: 'Sri Lanka',
      },
      profilePicture,
      role: "delivery",
      location: {
        type: 'Point',
        coordinates, // [lng, lat]
      }
    });

    await driver.save();

    await axios.post(`http://delivery-service:5004/api/delivery/driver`, {
      authDriverId: driver._id,
      phone: driver.phone,
      location: {
        type: 'Point',
        coordinates, // Ensure consistency with Driver location
      }
    });

    res.status(201).json({ message: "Driver registered successfully" });
  } catch (err) {
    console.error("Error during driver registration:", err.message);
    res.status(500).json({ error: err.message });
  }
};


export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('-password'); // exclude password
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    console.error("🔴 Error fetching driver by ID:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized – Invalid token' });
    }

    const userId = req.user.id;
    const { name, phone, email } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      userId,
      { name, phone, email },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Include all updated fields in the new token payload
    const token = jwt.sign(
      {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        role: updatedCustomer.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔑 New token generated:', token);

    res.json({
      message: 'Profile updated successfully',
      token,
      user: updatedCustomer,
    });
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete Profile
export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Deleting profile for user ID:', userId);
    const deletedCustomer = await Customer.findByIdAndDelete(userId);

    if (!deletedCustomer) {
      console.warn('🚫 User not found for deletion:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting profile:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteDriverById = async (req, res) => {
  try {
    const { driverId } = req.body;  // Driver ID in request body

    // Find the driver and delete it from the Driver collection
    const deletedDriver = await Driver.findByIdAndDelete(driverId);

    // If the driver was found and deleted, return success message
    if (deletedDriver) {
      return res.status(200).json({ message: "Driver account deleted successfully" });
    }

    // If no matching driver was found, return a "Driver not found" message
    return res.status(404).json({ message: "Driver not found" });
  } catch (err) {
    console.error("Error deleting driver:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};