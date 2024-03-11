// blockDirectIPAccess.js

const blockDirectIPAccess = (req, res, next) => {
  console.log('Middleware: Início do processamento');

  // Verifica se o IP é localhost
  if (req.headers.host.includes(`${process.env.LOCAL_HOST}:${process.env.LOCAL_PORT}`)) {
    console.log('localhost não executa o middleware');
    return next(); // Pula a execução do middleware
  }

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
};

// Exporta a função do middleware
module.exports = blockDirectIPAccess;