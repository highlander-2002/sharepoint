// server.js
const cds = require('@sap/cds');
const bodyParser = require('body-parser');

cds.on('bootstrap', app => {
  // Increase payload limit for all types
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.raw({ limit: '20mb', type: '*/*' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
});

module.exports = cds.server;
