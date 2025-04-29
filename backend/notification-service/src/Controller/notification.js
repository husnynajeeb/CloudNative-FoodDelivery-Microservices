// controllers/twilioController.js
const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

exports.sendMessage = async (req, res) => {
  const { to, message } = req.body;

  // Convert Sri Lankan local number starting with '0' to international format
  if (to.startsWith("0")) {
    to = "+94" + to.slice(1); // Replace starting 0 with +94
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
      sid: result.sid,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
