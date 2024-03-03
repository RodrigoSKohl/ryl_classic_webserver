// checkRegisterAccessMiddleware.js

const checkRegisterAccess = (req, res, next) => {
  const isRegister = req.path.endsWith('/register');
  const isAPIRegister = req.path .endsWith('/api/register');
  const isOriginFromRegister = req.headers.referer && req.headers.referer.endsWith('/register');

  if ((isAPIRegister && !isOriginFromRegister) || !isRegister) {
    return res.status(403).json({ error: 'Acccess Denied' });
  }

  next();
};

module.exports = checkRegisterAccess;