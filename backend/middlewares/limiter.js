//middlewares/limiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de requisições por IP
  message: 'Muitas requisições a partir deste IP, por favor, tente novamente após algum tempo.',
});

module.exports = limiter;