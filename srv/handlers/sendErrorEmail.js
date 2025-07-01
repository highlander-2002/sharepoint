
const nodemailer = require('nodemailer');

async function sendErrorEmail(errorMessage) {
  try {
    console.log('📤 Attempting to send error email...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'manoharkarthk@gmail.com',       // Replace with your email
        pass: 'szoy orlw eaib umbu'           // Use Gmail App Password if 2FA is enabled
      }
    });

    const mailOptions = {
      from: 'manoharkarthk@gmail.com',
      to: 'krishnam1413@gmail.com',          // Replace with recipient
      subject: 'Document Upload Error',
      text: `An error occurred:\n\n${errorMessage}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
  } catch (err) {
    console.error('❌ Failed to send error email:', err.message);
  }
}

module.exports = sendErrorEmail;