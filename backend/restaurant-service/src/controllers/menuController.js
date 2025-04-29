import MenuItem from '../models/Menu.js';
import multer from 'multer';
import path from 'path';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Images only (jpg, jpeg, png)!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

// Create a new menu item
export const createMenuItem = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      const { name, description, price, category, isAvailable } = req.body;
      const restaurantId = req.user.id;

      if (!name || !description || !price || !category) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      const newItem = new MenuItem({
        restaurantId,
        name,
        description,
        price: parseFloat(price),
        category,
        isAvailable: isAvailable === 'true' || isAvailable === true,
        image: req.file ? `/uploads/${req.file.filename}` : null
      });

      await newItem.save();
      newItem.image = newItem.image ? `http://192.168.43.178:5002${newItem.image}` : null;
      res.status(201).json({ message: 'Menu item created successfully', data: newItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// Get all menu items for logged-in restaurant
export const getMyMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.user.id });
    const updatedItems = items.map(item => ({
      ...item.toObject(),
      image: item.image ? `http://192.168.43.178:5002${item.image}` : null
    }));
    res.json(updatedItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get public menu by restaurantId
export const getMenuByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const items = await MenuItem.find({ restaurantId, isAvailable: true });
    const updatedItems = items.map(item => ({
      ...item.toObject(),
      image: item.image ? `http://192.168.43.178:5002${item.image}` : null
    }));
    res.json(updatedItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update menu item
export const updateMenuItem = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      const { id } = req.params;
      const { name, description, price, category, isAvailable } = req.body;

      if (!name || !description || !price || !category) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }

      const updateData = {
        name,
        description,
        price: parseFloat(price),
        category,
        isAvailable: isAvailable === 'true' || isAvailable === true
      };

      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const updatedItem = await MenuItem.findOneAndUpdate(
        { _id: id, restaurantId: req.user.id },
        updateData,
        { new: true }
      );

      if (!updatedItem) {
        return res.status(404).json({ message: 'Menu item not found' });
      }

      updatedItem.image = updatedItem.image ? `http://192.168.43.178:5002${updatedItem.image}` : null;
      res.json({ message: 'Menu item updated', data: updatedItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MenuItem.findOneAndDelete({ _id: id, restaurantId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single menu item by ID
export const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findOne({ _id: id, restaurantId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    item.image = item.image ? `http://192.168.43.178:5002${item.image}` : null;
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};