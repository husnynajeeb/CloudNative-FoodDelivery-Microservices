import express from 'express';
import { getAllRestaurants , getRestaurantById , createRestaurant} from '../controllers/RestaurantController.js';


const router = express.Router();

router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);
router.post('/', createRestaurant); // 🔥 New route to create restaurant


export default router;