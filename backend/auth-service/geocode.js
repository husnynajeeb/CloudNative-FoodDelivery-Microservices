import axios from 'axios';

export async function geocodeAddress(address) {
  const apiKey = 'AIzaSyAi3F_nxCXmU6kcTP0KFXw4B4AsW-E-8jk'; // example
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return [location.lng, location.lat]; // Important: [lng, lat]
    } else {
      console.error('Geocoding error:', response.data.status);
      return null;
    }
  } catch (error) {
    console.error('Geocoding request failed:', error.message);
    return null;
  }
}
