const cds = require('@sap/cds');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const nodemailer = require('nodemailer');
const sendErrorEmail = require('./handlers/sendErrorEmail');
const sendSuccessEmail = require('./handlers/sendSuccessEmail');

module.exports = cds.service.impl(async function () {
  const { UploadedDocuments } = cds.entities;

  function generateFileHash(base64Content) {
    return crypto.createHash('sha256').update(base64Content).digest('hex');
  }

  // 📤 Upload Document
  this.on('uploadDocument', async (req) => {
    try {
      const { PSnumber, Source, DocumentName, File, FileType } = req.data;
      console.log('📦 Incoming request data:', req.data);

      if (!File) {
        const msg = 'File content is missing';
        await sendErrorEmail(`Upload failed: ${msg}`);
        req.error(400, msg);
        return;
      }

      // Step 1: Get OAuth Token
      const tokenResponse = await axios.post(
        'https://dms-ivizonapitest.azurewebsites.net/TOKEN',
        new URLSearchParams({
          grant_type: 'password',
          username: 'subconuser@531',
          password: 'Subconuser1@ltim'
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const token = tokenResponse.data.access_token;
      const formatted = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];

      // Step 2: Upload Document
      const uploadPayload = {
        Source,
        PSNO: PSnumber,
        DocumentName,
        File,
        FileType,
        Year: formatted
      };
      console.log('📤 Upload payload:', uploadPayload);

      const uploadResponse = await axios.post(
        'https://dms-ivizonapitest.azurewebsites.net/api/UploadDocument',
        uploadPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const responseData = uploadResponse.data;
      console.log('📥 Upload response:', responseData);

      // Step 3: Proceed only if upload was successful
      if (responseData === 'Success') {
        const fileHash = generateFileHash(File);

        const existing = await SELECT.one.from(UploadedDocuments).where({ hash: fileHash });
        if (existing) {
          const msg = `Duplicate file detected for DocumentName: ${DocumentName}`;
          await sendErrorEmail(msg);
          req.error(409, msg);
          return;
        }

        await INSERT.into(UploadedDocuments).entries({
          hash: fileHash,
          name: DocumentName,
          psNumber: PSnumber,
          source: Source,
          createdAt: new Date().toISOString()
        });

        const successMessage = `✅ Document "${DocumentName}" uploaded successfully.\n\nDetails:\n${JSON.stringify(responseData, null, 2)}`;
        await sendSuccessEmail(successMessage);
      } else {
        const errorMessage = `⚠️ Document "${DocumentName}" upload returned a non-success response.\n\nResponse:\n${JSON.stringify(responseData, null, 2)}`;
        await sendErrorEmail(errorMessage);
      }

      if (responseData.value && responseData.value.includes('Invalid')) {
        req.error(400, responseData.value);
        return;
      }

      return responseData;

    } catch (error) {
      console.error('❌ Exception during upload:', error.message);
      await sendErrorEmail(`Exception during upload: ${error.message}`);
      req.error(500, 'Document upload failed');
    }
  });

  // 📧 Send Base64 Email from File Path
  this.on('sendFileAsBase64Email', async (req) => {
    const { filePath, recipientEmail } = req.data;

    if (!filePath || !recipientEmail) {
      req.error(400, 'Missing filePath or recipientEmail');
      return;
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const base64String = fileBuffer.toString('base64');

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'manoharkarthk@gmail.com',
          pass: 'pxoo siwy rjqe apnw' // App password
        }
      });

      await transporter.sendMail({
        from: 'manoharkarthk@gmail.com',
        to: recipientEmail,
        subject: 'Base64 Encoded File',
        text: `Here is the Base64 string of the file:\n\n${base64String}`
      });

      return { message: 'Email sent successfully' };
    } catch (error) {
      console.error('❌ Error sending Base64 email:', error.message);
      req.error(500, 'Failed to send Base64 email');
    }
  });
});
