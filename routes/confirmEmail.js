const express = require('express');
const router = express.Router();
const { pool, mssql } = require('../models/connect');
const cacheStorage = require('../utils/cache.js'); // Importe a instância de cache
const dbTable = process.env.DB_TABLE; // Nome da tabela a partir da variável de ambiente

// Função para executar uma transação
function transaction(pool, body) {
  const transaction = new mssql.Transaction(pool);
  return new Promise((resolve, reject) => {
    transaction.begin(err => {
      if (err) return reject(err);

      body(transaction)
        .then(() => {
          transaction.commit(err => {
            if (err) return reject(err);
            resolve();
          });
        })
        .catch(err => {
          transaction.rollback(() => {
            reject(err);
          });
        });
    });
  });
}

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
      // Verificar se os dados do usuário estão armazenados no cache
      const userData = cacheStorage.get(email);

      if (!userData) {
        response.error = 'User data not found or expired.';
      } else {
        const { username, senha, confirmationToken: storedConfirmationToken } = userData;

        // Verificar se o token de confirmação enviado é o mesmo que foi gerado
        if (confirmationToken !== storedConfirmationToken) {
          response.error = 'Invalid confirmation token.';
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

              // Remover os dados do usuário do cache após o registro
              cacheStorage.del(email);
            } else {
              console.error('Error creating user: No rows affected by insertion.');
              response.error = 'Internal server error';
              throw new Error(response.error); // Rollback da transação em caso de erro
            }
          });
        }
      }
    } catch (err) {
      console.error('Error creating user:', err.message);
      response.error = 'Internal server error';
    }
  }

  // Renderizar o HTML com os dados e enviar a resposta JSON
  res.render('confirm-email', {
    currentPage: 'confirm-email',
    response: response
  });
});

module.exports = router;