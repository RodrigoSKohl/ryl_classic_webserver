const express = require('express');
const router = express.Router();
const { pool, mssql } = require('../models/connect');
const { transaction } = require('../models/dbFunctions');
const cacheStorage = require('../utils/cache.js');
const dbTable = process.env.DB_TABLE;
const {
  checkExistingUser,
  checkExistingEmail,
} = require('../models/dbFunctions');

router.get('/confirm-email', async (req, res) => {
  const { email, confirmationToken } = req.query;
  let response = {
    success: undefined,
    error: undefined,
    user: undefined
  };

  if (!email || !confirmationToken) {
    response.error = 'Missing parameters.';
  } else {
    try {
      const userData = cacheStorage.get(email);
      cacheStorage.del(email);

      if (!userData) {
        response.error = 'User data not found or expired.';
      } else {
        const { username, senha, confirmationToken: storedConfirmationToken } = userData;

        if (confirmationToken !== storedConfirmationToken) {
          response.error = 'Invalid confirmation token.';
        } else {
          try {
            // Verificar se o username ou email já existe no banco de dados
            const existingUser = await checkExistingUser(username, pool, mssql, dbTable);
            const existingEmail = await checkExistingEmail(email, pool, mssql, dbTable);
            if (existingUser || existingEmail) {
              response.error = 'Account is already registered';
            } else {
              await transaction(pool, async transaction => {
                const request = new mssql.Request(transaction);
                const result = await request
                  .input('username', mssql.VarChar(12), username)
                  .input('senha', mssql.VarChar(30), senha)
                  .input('email', mssql.VarChar(50), email)
                  .query(`
                    INSERT INTO ${dbTable} (account, passwd, email)
                    OUTPUT Inserted.account, Inserted.email
                    VALUES (@username, @senha, @email)
                  `);

                if (result.rowsAffected && result.rowsAffected[0] === 1) {
                  response.success = 'User created successfully';
                  console.log('Usuário criado com sucesso');
                  console.log('Username:', result.recordset[0].account);
                  console.log('Email:', result.recordset[0].email);

                  // Armazenar nome de usuário e email no objeto de resposta
                  response.user = {
                    account: result.recordset[0].account,
                    email: result.recordset[0].email
                  };
                } else {
                  console.error('Error creating user: No rows affected by insertion.');
                  response.error = 'Internal server error';
                  throw new Error(response.error); // Rollback da transação em caso de erro
                }
              });
            }
          } catch (err) {
            console.error('Error creating user:', err.message);
            response.error = 'Internal server error';
          }
        }
      }
    } catch (err) {
      console.error('Error:', err.message);
      response.error = 'Internal server error';
    }
  }

  res.render('confirm-email', {
    currentPage: 'confirm-email',
    response: response
  });
});

module.exports = router;