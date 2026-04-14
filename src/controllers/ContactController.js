const mailSend = require("../utills/MailUtil");

const sendContactEmail = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    // ✅ Email content (HTML)
    const htmlContent = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/> ${message}</p>
    `;

    // ✅ Send to YOUR email
    await mailSend(
      process.env.EMAIL_USER,
      "New Contact Message - Vehicle Vault",
      htmlContent
    );

    // ✅ OPTIONAL: Auto-reply to user (recommended 🔥)
    const autoReply = `
      <h2>Thank you for contacting Vehicle Vault</h2>
      <p>Dear ${fullName},</p>
      <p>We received your message and will get back to you soon.</p>
    `;

    await mailSend(
      email,
      "We received your message",
      autoReply
    );

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });

  } catch (error) {
    console.error("Contact Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};

module.exports = { sendContactEmail };