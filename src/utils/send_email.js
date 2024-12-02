import express from "express";
import { createTransport } from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3001; // Change the port number if needed

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Middleware to parse JSON requests

// Create a transporter object using SMTP transport
const transporter = createTransport({
  service: "Gmail", // Use the email service you prefer
  auth: {
    user: "emb1910059@student.ctu.edu.vn",
    pass: "hQvX8DQFZh",
  },
});

// POST endpoint for sending email
app.post("/invite-user", async (req, res) => {
  const { to, subject, text } = req.body;

  const mailOptions = {
    from: "socialmedia@gmail.com", // Email sender
    to, // Recipient
    subject, // Email subject
    text, // Email body
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error sending email:", error);
    }
    console.log("Email sent successfully:", info.response);
  });
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Error account email:", "emb1910059@student.ctu.edu.vn");
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
