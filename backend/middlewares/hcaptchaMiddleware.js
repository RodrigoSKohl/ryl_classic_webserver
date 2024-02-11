//middlewares/hcaptchaMiddleware.js

async function validateHcaptchaMiddleware(req, res, next) {
  const { 'h-captcha-response': hcaptchaToken, } = req.body;

  // Validar o hCaptcha
  const isHcaptchaValid = await validateHcaptcha(hcaptchaToken, process.env.CAPTCHA_SECRET_KEY, process.env.HCAPTCHA_SITE);

  if (!isHcaptchaValid) {
    return res.status(400).json({ error: 'Falha na verificação hCaptcha.' });
  }

  // Se a validação for bem-sucedida, continue com a próxima função/middleware
  next();
}

async function validateHcaptcha(token, secretKey, site) {
  const response = await fetch(site, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${secretKey}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
}

module.exports = validateHcaptchaMiddleware;



