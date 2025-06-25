const cds = require('@sap/cds');
const axios = require('axios');
const fs = require('fs');
const { request } = require('http');
const path = require('path');
 
module.exports = cds.service.impl(async function () {
    this.on('uploadDocument', async (req) => {
        try {
            const { PSnumber, Source, DocumentName, File, FileType } = req.data
            console.log(req.data)
 
            if (!File) {
                req.error(400, 'File content is missing');
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

            const isoString = new Date();
            const date = new Date(isoString);
 
            const formatted = date.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
 
           
 
            // Step 3: Upload Document
            const uploadPayload = {
                Source: Source,
                PSNO: PSnumber,
                DocumentName: DocumentName,
                File: File,
                FileType: FileType,
                Year:formatted
            };
            console.log(uploadPayload)
 
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
            console.log(uploadResponse.data)
 
            return uploadResponse.data;
 
        } catch (error) {
            console.error('Error uploading document:', error.message);
            req.error(500, 'Document upload failed');
        }
    });
});
 
 