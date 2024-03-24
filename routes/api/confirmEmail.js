const express = require('express');
const router = express.Router();
const { pool, mssql } = require('../../models/connect');
const cacheStorage = require('../../utils/cache.js'); // Importe a instância de cache
const dbTable = process.env.DB_TABLE; // Nome da tabela a partir da variável de ambiente


router.get('/api/confirm-email', async (req, res) => {
  const { email, confirmationToken } = req.query;

  if (!email || !confirmationToken) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    // Verificar se os dados do usuário estão armazenados no cache
    const userData = cacheStorage.get(email);

    if (!userData) {
      return res.status(400).json({ error: 'User data not found or expired.' });
    }

    const { username, senha, confirmationToken: storedConfirmationToken } = userData;

    // Verificar se o token de confirmação enviado é o mesmo que foi gerado
    if (confirmationToken !== storedConfirmationToken) {
      return res.status(400).json({ error: 'Invalid confirmation token.' });
    }

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
        const createdUser = result.recordset[0];
        console.log('Usuário criado com sucesso');
        console.log('Username:', createdUser.account);
        console.log('Email:', createdUser.email);

        // Remover os dados do usuário do cache após o registro
        cacheStorage.del(email);

        res.status(201).json({ success: 'successfully registered user', user: createdUser });
      } else {
        console.error('Erro ao criar usuário: Nenhuma linha afetada pela inserção.');
        res.status(500).json({ error: 'internal server error' });
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err.message);
      res.status(500).json({ error: 'internal server error' });
    } finally {
      // Sempre liberar a conexão, mesmo se ocorrer um erro
      connection.release();
    }
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
