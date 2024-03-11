// blockDirectIPAccess.js

const ip = require('ip');

const blockDirectIPAccess = (req, res, next) => {
  console.log('Middleware: Início do processamento');

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
  const firstDomain = allowedOrigins[0];
  const isIP = ip.isV4Format(req.headers.host) || ip.isV6Format(req.headers.host);

  // Função para redirecionar para o primeiro domínio
  const redirectToFirstDomain = () => {
    console.log('Middleware: Redirecionando para o primeiro domínio');
    return res.redirect(301, `https://${firstDomain}${req.url}`);
  };


  if (isIP || !req.headers.host) {
    console.log('Middleware: Acesso negado');
    return redirectToFirstDomain();
  }

  console.log('Middleware: Acesso permitido');
  next(); // Continua a execução do middleware
};

// Exporta a função do middleware
module.exports = blockDirectIPAccess;
