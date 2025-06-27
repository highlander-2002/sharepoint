const cds = require('@sap/cds');
const axios = require('axios');
const sendErrorEmail = require('./handlers/sendErrorEmail'); // Ensure this file exists and is correctly named
const sendSuccessEmail = require('./handlers/sendSuccessEmail');
module.exports = cds.service.impl(async function () {
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
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const token = tokenResponse.data.access_token;

            // Format timestamp
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

            if (responseData === 'Success') {
                const successMessage = `✅ Document "${DocumentName}" uploaded successfully.\n\nDetails:\n${JSON.stringify(responseData, null, 2)}`;
                await sendSuccessEmail(successMessage);
            } else {
                const errorMessage = `⚠️ Document "${DocumentName}" upload returned a non-success response.\n\nResponse:\n${JSON.stringify(responseData, null, 2)}`;
                await sendErrorEmail(errorMessage);
            }


            // Optional: handle known error messages
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
});

