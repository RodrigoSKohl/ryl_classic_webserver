//middlewares/limiter.js
const rateLimit = require('express-rate-limit');

// Função para converter o formato da string em milissegundos
function convertToMilliseconds(timeString) {
  const regex = /^(\d+)([smh]?)$/;
  const match = timeString.match(regex);

  if (!match) {
    throw new Error('Formato de tempo inválido. Use um formato como "1m", "30s" ou "2h".');
  }

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 's':
      return value * 1000; // segundos para milissegundos
    case 'm':
      return value * 60 * 1000; // minutos para milissegundos
    case 'h':
      return value * 60 * 60 * 1000; // horas para milissegundos
    default:
      return value * 60 * 1000; // se não houver unidade, assume-se que está em minutos
  }
}

// Configuração do limite de taxa para prevenir ataques de força bruta
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW && convertToMilliseconds(process.env.RATE_LIMIT_WINDOW),
  max: process.env.RATE_LIMIT_MAX,
  message: 'Muitas requisições a partir deste IP, por favor, tente novamente após algum tempo.',
});

module.exports = limiter;