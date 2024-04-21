const express = require('express');
const router = express.Router();
const { pool, mssql } = require('../models/connect');
const cacheStorage = require('../utils/cache.js');
const dbTable = process.env.DB_TABLE;
const {
  checkExistingEmail,
} = require('../models/dbFunctions');

router.get('/change-password', async (req, res) => {
  const { email, confirmationToken } = req.query;
  let response = {
    success: undefined,
    error: undefined,
    user: undefined,
    renderForm: false // Definindo por padrão como falso
  };

  if (!email || !confirmationToken) {
    response.error = 'Missing parameters.';
  } else {
    try {
      const userData = cacheStorage.get(email);

      if (!userData) {
        response.error = 'User data not found or expired.';
      } else {
        const { confirmationToken: storedConfirmationToken } = userData;

        if (confirmationToken !== storedConfirmationToken) {
          response.error = 'Invalid confirmation token.';
        } else {
          // Verificar se email existem no banco de dados
          const existingEmail = await checkExistingEmail(email, pool, mssql, dbTable);
          if (!existingEmail) {
            response.error = 'Account does not exist';
          } else {
            response.renderForm = true; // Indica que o formulário deve ser renderizado
          }
        }
      }
    } catch (err) {
      console.error('Error:', err.message);
      response.error = 'Internal server error';
    }
  }

  res.render('change-password', {
    currentPage: 'change-password',
    csrfToken: req.csrfToken(),
    response: response
  });
});

module.exports = router;