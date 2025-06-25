const cds = require('@sap/cds');
const axios = require('axios');
const fs = require('fs');
const { request } = require('http');
const path = require('path');

module.exports = cds.service.impl(async function () {
  this.on('uploadDocument', async (req) => {
    try {
        const {PSnumber}=req.data
        console.log(req.data)
      // Step 1: Get OAuth Token
      const tokenResponse = await axios.post(
        'https://dms-ivizonapitest.azurewebsites.net/TOKEN',
        new URLSearchParams({
          grant_type: 'password',
          username: 'subconuser@531',
          password: 'YOUR_PASSWORD_HERE' // Replace securely
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const token = tokenResponse.data.access_token;

      // Step 2: Read and encode PDF file
      const filePath = path.join(__dirname, '../files/your_document.pdf'); // Adjust path
      const fileBuffer = fs.readFileSync(filePath);
      const encodedFile = fileBuffer.toString('base64');

      // Step 3: Upload Document
      const uploadPayload = {
        Source: '',
        PSNO: PSnumber,
        DocumentName: 'P.S Retainer ship Agreement - New Renewals',
        File: encodedFile,
        FileType: 'pdf'
      };

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

      return uploadResponse.data;

    } catch (error) {
      console.error('Error uploading document:', error.message);
      req.error(500, 'Document upload failed');
    }
  });
});
