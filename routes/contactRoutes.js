const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New contact request from ${name}`,
      text: message,
    });

    res.status(200).json({ message: 'Your message has been sent.' });
  } catch (err) {
    console.error('Error sending contact email:', err);
    res.status(500).json({ error: 'Could not send message.' });
  }
});

module.exports = router;
