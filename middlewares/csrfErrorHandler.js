// middlewares/csrfErrorHandler.js
const csrfErrorHandler = (err, req, res, next) => {
  if (err && err.code === 'EBADCSRFTOKEN') {
    // Erro CSRF detectado
    return res.status(403).json({ error: 'invalid CSRF Token.' });
  }
  // Se não for um erro CSRF, passe para o próximo middleware de erro
  next(err);
};

module.exports = csrfErrorHandler;