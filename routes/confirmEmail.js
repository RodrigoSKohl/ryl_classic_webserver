const express = require('express');
const router = express.Router();
const { pool, mssql } = require('../models/connect');
const cacheStorage = require('../utils/cache.js'); // Importe a instância de cache
const dbTable = process.env.DB_TABLE; // Nome da tabela a partir da variável de ambiente


router.get('/confirm-email', async (req, res) => {
  const { email, confirmationToken } = req.query;
  let successMessage, user, errorMessage;

  if (!email || !confirmationToken) {
    errorMessage = 'Missing parameters.';
  }

  try {
    // Verificar se os dados do usuário estão armazenados no cache
    const userData = cacheStorage.get(email);

    if (!userData) {
      errorMessage = 'User data not found or expired.';
    } else {
      const { username, senha, confirmationToken: storedConfirmationToken } = userData;

      // Verificar se o token de confirmação enviado é o mesmo que foi gerado
      if (confirmationToken !== storedConfirmationToken) {
        errorMessage = 'Invalid confirmation token.';
      } else {
        // Inserir usuário no banco de dados
        const connection = await pool.connect();

        try {
          const result = await connection.request()
            .input('username', mssql.VarChar(12), username)
            .input('senha', mssql.VarChar(30), senha)
            .input('email', mssql.VarChar(50), email)
            .query(`
              INSERT INTO ${dbTable} (account, passwd, email)
              OUTPUT Inserted.account, Inserted.email
              VALUES (@username, @senha, @email)
            `);

          if (result.rowsAffected && result.rowsAffected[0] === 1) {
            user = result.recordset[0];
            successMessage = 'User created successfully';
            console.log('Usuário criado com sucesso');
            console.log('Username:', user.account);
            console.log('Email:', user.email);

            // Remover os dados do usuário do cache após o registro
            cacheStorage.del(email);
          } else {
            errorMessage = 'Error creating user: No rows affected by insertion.';
          }
        } catch (err) {
          console.error('Error creating user:', err.message);
          errorMessage = 'Internal server error';
        } finally {
          // Sempre liberar a conexão, mesmo se ocorrer um erro
          if (connection) {
            connection.release();
          }
        }
      }
    }
  } catch (err) {
    console.error('Error creating user:', err.message);
    errorMessage = 'Internal server error';
  }

  // Renderizar o HTML com os dados e enviar a resposta JSON
  res.render('confirm-email', {
    currentPage: 'confirm-email',
    success: successMessage,
    user: user,
    error: errorMessage
  });
});


module.exports = router;
