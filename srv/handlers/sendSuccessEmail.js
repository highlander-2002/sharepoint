const nodemailer = require('nodemailer');

module.exports = async function sendSuccessEmail(message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail'
    auth: {
      user: 'manoharkarthk@gmail.com',
      pass: 'szoy orlw eaib umbu'
    }
  });

  const mailOptions = {
    from: 'manoharkarthk@gmail.com',
    to: 'krishnam1413@gmail.com',
    subject: '✅ Document Upload Successful',
    text: 'The File is uploaded Successfully'
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Success email sent.');
  } catch (error) {
    console.error('❌ Failed to send success email:', error);
  }
};

