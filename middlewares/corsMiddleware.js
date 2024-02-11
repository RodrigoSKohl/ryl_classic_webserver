//middlewares/corsMiddleware.js
const cors = require('cors');

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(','); //origens do cors
const corsOptions = {
  origin: allowedOrigins, 
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type',
  credentials: true,
  optionsSuccessStatus: 204,
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;