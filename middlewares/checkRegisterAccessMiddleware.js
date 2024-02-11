// checkRegisterAccessMiddleware.js

const checkRegisterAccess = (req, res, next) => {
    if (req.baseUrl === '/api/register') {
      return res.status(403).json({ error: 'Acesso proibido diretamente a esta rota.' });
    }
    next();
  };
  
  module.exports = checkRegisterAccess;