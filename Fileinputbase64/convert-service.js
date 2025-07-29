// convert-service.js

const fs = require('fs');
const nodemailer = require('nodemailer');

// === CONFIGURATION ===
const filePath = './Fileinputbase64/HWGe1GO2.pdf';
const recipientEmail = 'manoharkarthk@gmail.com';
const smtpUser = 'manoharkarthk@gmail.com';
const smtpPass = 'pxoo siwy rjqe apnw';
const smtpHost = 'smtp.gmail.com';
const smtpPort = 587;

// === READ FILE AND CONVERT TO BASE64 ===
const fileBuffer = fs.readFileSync(filePath);
const base64String = fileBuffer.toString('base64');

// === SEND EMAIL ===
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const mailOptions = {
  from: smtpUser,
  to: recipientEmail,
  subject: 'Base64 Encoded File',
  text: `Here is the Base64 string of the file:\n\n${base64String}`,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.error('Error sending email:', error);
  }
  console.log('Email sent:', info.response);
});
