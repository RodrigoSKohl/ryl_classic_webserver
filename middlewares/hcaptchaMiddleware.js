//middlewares/hcaptchaMiddleware.js

async function validateHcaptchaMiddleware(req, res, next) {
  // Verificar se a validação do hCaptcha já ocorreu nesta sessão
  if (req.session.hcaptchaValidated) {
    // Se já foi validado, passe para o próximo middleware
    return next();
  }

  const { 'h-captcha-response': hcaptchaToken } = req.body;

  // Validar o hCaptcha
  const isHcaptchaValid = await validateHcaptcha(hcaptchaToken, process.env.CAPTCHA_SECRET_KEY, process.env.HCAPTCHA_SITE);

  if (!isHcaptchaValid) {
    // Se a validação falhar, retorne uma resposta de erro
    return res.status(400).json({ error: 'hCaptcha verified failed' });
  }

  // Marcar a validação do hCaptcha como concluída na sessão
  req.session.hcaptchaValidated = true;

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