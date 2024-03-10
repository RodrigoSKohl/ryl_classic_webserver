// blockDirectIPAccess.js

const blockDirectIPAccess = (req, res, next) => {
  console.log('Middleware: Início do processamento');

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');
  const firstDomain = allowedOrigins[0];

  const redirectToFirstDomain = () => {
    console.log('Middleware: Redirecionando para o primeiro domínio');
    return res.redirect(301, `https://${firstDomain}${req.url}`);
  };

  // Verifica se o header "host" está presente na solicitação
  if (!req.headers.host) {
    console.log('Middleware: Header "host" não presente');
    return redirectToFirstDomain();
  }

  // Verifica se o hostname corresponde a pelo menos uma das origens permitidas
  if (!allowedOrigins.includes(req.headers.host)) {
    console.log(`Middleware: Host não permitido - ${req.headers.host}`);
    return redirectToFirstDomain();
  }

  // Se tudo estiver correto, continua para a próxima middleware
  console.log('Middleware: Condições atendidas, continua para a próxima middleware');
  next();
};

// Exporta a função do middleware
module.exports = blockDirectIPAccess;