import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail", // Use the email service you prefer
  auth: {
    user: "phucxh008@gmail.com", // Your email address
    pass: "0899656100Phuc", // Your email password or app password
  },
});

// Correctly specify types for req and res
export const sendInvitationEmail = functions.https.onRequest(
  async (req: functions.Request, res: functions.Response): Promise<void> => {
    // Ensure the return type is void
    // Check if the request method is POST
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return; // Stop execution after sending the response
    }

    const {email} = req.body;

    // Validate the email address
    if (!email || typeof email !== "string") {
      res.status(400).send("Invalid email address");
      return; // Stop execution after sending the response
    }

    const mailOptions = {
      from: "baohqgcs17182@fpt.edu.vn",
      to: email,
      subject: "Invitation to Join",
      text: "You have been invited to join our platform!",
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).send("Error sending email");
    }
  }
);
