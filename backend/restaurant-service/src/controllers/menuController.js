import MenuItem from '../models/Menu.js'// Assuming you have a MenuItem model defined
// 👉 Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    const restaurantId = req.user.id; // From JWT middleware

    // const restaurantId = "680753e1cfb3f48e77432161";

    const newItem = new MenuItem({
      restaurantId,
      name,
      description,
      price,
      category,
      isAvailable
    });
    

    await newItem.save();
    res.status(201).json({ message: 'Menu item created successfully', data: newItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Get all menu items for logged-in restaurant
export const getMyMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.user.id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Get public menu by restaurantId
export const getMenuByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const items = await MenuItem.find({ restaurantId, isAvailable: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await MenuItem.findOneAndUpdate(
      { _id: id, restaurantId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated', data: updatedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 👉 Delete menu item
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
// New route: Get a single menu item by ID
export const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findOne({ _id: id, restaurantId: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};