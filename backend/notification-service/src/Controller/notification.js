const dotenv = require("dotenv");
dotenv.config();

const axios = require('axios');


const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;

exports.sendSms = async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'phoneNumber and message are required' });
  }

  try {
    const response = await axios.post(
      `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
      {
        recipients: [phoneNumber],
        message,
      },
      {
        headers: {
          'x-api-key': TEXTBEE_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error sending SMS:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};