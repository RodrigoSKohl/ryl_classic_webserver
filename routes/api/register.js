  const express = require('express');
  const router = express.Router();
  const { pool, mssql } = require('../../models/connect');
  const { sendConfirmationEmail } = require('../../utils/email.js'); // Importe a função de envio de e-mail
  const {
    checkExistingUser,
    checkExistingEmail,
  } = require('../../models/dbFunctions');
  const validateHcaptchaMiddleware = require('../../middlewares/hcaptchaMiddleware');
  const validator = require('validator');
  const cacheStorage = require('../../utils/cache.js'); // Importe a instância de cache
  const dbTable = process.env.DB_TABLE; // Nome da tabela a partir da variável de ambiente

  // Função para gerar um token de confirmação de e-mail único
  function generateConfirmationToken() {
    const length = 32; // Comprimento do token
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Caracteres possíveis no token
    let token = '';

    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length)); // Adiciona um caractere aleatório ao token
    }

    return token;
  }

  const tokenExp = process.env.TOKEN_EXPIRATION || 1200; // Tempo de expiração do token em segundos

  router.post('/api/register', validateHcaptchaMiddleware, async (req, res) => {
    let connection;

    try {
      const { username, senha, confirmarSenha, email } = req.body;

      // Conectar ao banco de dados utilizando a instância única de pool
      connection = await pool.connect();

      // Array de erros
      const errors = [];

      // Validar a senha, o formato do username e do email
      if (senha.length < 6) {
        errors.push('password must be at least 6 characters');
      }
      if (senha !== confirmarSenha) {
        errors.push('passwords not match');
      }
      if (!validator.isAlphanumeric(username)) {
        errors.push('invalid username format');
      }
      if (!validator.isEmail(email)) {
        errors.push('invalid email format');
      }

      // Verificar se o username já existe no banco de dados
      const existingUser = await checkExistingUser(username, connection, mssql, dbTable);
      if (existingUser) {
        errors.push('username already exists');
      }

      // Verificar se o email já existe no banco de dados
      const existingEmail = await checkExistingEmail(email, connection, mssql, dbTable);
      if (existingEmail) {
        errors.push('email already in use');
      }

      // Se houver erros de validação, retorne uma resposta com status 400
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      // Verificar se o e-mail já recebeu um e-mail de confirmação
      if (cacheStorage.has(email)) {
        // Se o e-mail já estiver no cache, significa que um e-mail de confirmação já foi enviado
        // Gerar um novo token de confirmação de e-mail único
        const confirmationToken = generateConfirmationToken();
                // Remover os dados do usuário antigo do cache
        cacheStorage.del(email);
        //Adicionar novos dados ao cache
        cacheStorage.set(email, { username, senha, confirmationToken }, tokenExp);
        // Gerar um URL de confirmação de e-mail com o novo token
        const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
        const firstOrigin = allowedOrigins[0];
        const confirmationURL = `https://${firstOrigin}/confirm-email?email=${email}&confirmationToken=${confirmationToken}`;
        const subject = `Ryl Classic Email Confirmation`; // Subject line
        const textBody = `Please click on the following link to confirm your email: ${confirmationURL}`;
        const htmlBody = `<p><a href="${confirmationURL}">Please click here to confirm your email</a></p>`;

        // Enviar o e-mail de confirmação com as novas informações
        await sendConfirmationEmail(email, subject, textBody, htmlBody);

        return res.status(201).json({ success: 'Confirmation email resent. Wait 10 minutes and verify your email to complete registration.' });
      }

      // Gerar um token de confirmação de e-mail único
      const confirmationToken = generateConfirmationToken();

      // Armazenar os dados do usuário na cache com um tempo de expiração
      cacheStorage.set(email, { username, senha, confirmationToken }, tokenExp); // Multiplicar por 1000 para converter segundos em milissegundos

      // Gerar um URL de confirmação de e-mail com o token
      const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
      const firstOrigin = allowedOrigins[0];
      const confirmationURL = `https://${firstOrigin}/confirm-email?email=${email}&confirmationToken=${confirmationToken}`;
      const subject = `Ryl Classic Email Confirmation`; // Subject line
      const textBody = `Please click on the following link to confirm your email: ${confirmationURL}`;
      const htmlBody = `<p><a href="${confirmationURL}">Please click here to confirm your email</a></p>`;

      // Enviar o e-mail de confirmação
      await sendConfirmationEmail(email, subject, textBody, htmlBody);

      return res.status(201).json({ success: 'Confirmation email sent. Wait 10 minutes and verify your email to complete registration.' });
    } catch (err) {
      console.error('Error creating user:', err.message);
      res.status(500).json({ error: 'internal server error' });
    } finally {
      // Sempre liberar a conexão, mesmo se ocorrer um erro
      if (connection) {
        connection.release();
      }
    }
  });

  module.exports = router;