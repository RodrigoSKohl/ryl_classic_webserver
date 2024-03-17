// blockDirectIPAccess.js

const ip = require('ip');

const blockDirectIPAccess = (req, res, next) => {

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
  const firstDomain = allowedOrigins[0];
  const isIP = ip.isV4Format(req.headers.host) || ip.isV6Format(req.headers.host);

  // Função para redirecionar para o primeiro domínio
  const redirectToFirstDomain = () => {
    return res.redirect(301, `https://${firstDomain}${req.url}`);
  };


  if (isIP || !req.headers.host) {
    return redirectToFirstDomain();
  }

  next(); // Continua a execução do middleware
};

// Exporta a função do middleware
module.exports = blockDirectIPAccess;
