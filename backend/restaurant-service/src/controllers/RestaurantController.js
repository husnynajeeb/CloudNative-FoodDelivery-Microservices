import Restaurant from '../models/Restaurant.js';

export const createRestaurant = async (req, res) => {
  try {
    const { name, location, menu } = req.body;

    // Validate required fields
    if (!name || !location || !location.coordinates || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Name and valid location coordinates are required.' });
    }

    const newRestaurant = new Restaurant({
      name,
      location: {
        type: 'Point',
        coordinates: location.coordinates, // [longitude, latitude]
      },
      menu: menu || [], // Optional, can be empty
    });

    const savedRestaurant = await newRestaurant.save();
    res.status(201).json(savedRestaurant);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ message: 'Server error while creating restaurant.' });
  }
};


export const getAllRestaurants = async (req, res) => {
  const data = await Restaurant.find();
  res.json(data);
};

export const getRestaurantById = async (req, res) => {
  const data = await Restaurant.findById(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};
