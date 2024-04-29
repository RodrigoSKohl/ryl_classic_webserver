const express = require('express');
const router = express.Router();
const { pool, mssql } = require('../../models/connect');
const { transaction } = require('../../models/dbFunctions');
const validateHcaptchaMiddleware = require('../../middlewares/hcaptchaMiddleware');
const { checkExistingEmail } = require('../../models/dbFunctions');
const cacheStorage = require('../../utils/cache.js'); // Importe a instância de cache
const dbTable = process.env.DB_TABLE; // Nome da tabela a partir da variável de ambiente

router.post('/api/change-password', validateHcaptchaMiddleware, async (req, res) => {
  let connection;

  try {
    const { email, confirmationToken, senha, confirmarSenha } = req.body;

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

    // Verificar se o email existe no banco de dados
    const existingEmail = await checkExistingEmail(email, connection, mssql, dbTable);
    if (!existingEmail) {
      errors.push('email not exist');
    }

    // Verificar se o token é válido
    const userData = cacheStorage.get(email);
    if (!userData || userData.confirmationToken !== confirmationToken) {
      errors.push('Invalid confirmation token.');
    }

    // Se houver erros de validação, retorne uma resposta com status 400
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    let accountName;

    // Se tudo estiver correto, prossiga com a troca de senha
    await transaction(pool, async transaction => {
      const request = new mssql.Request(transaction);
      const result = await request
        .input('email', mssql.VarChar(50), email)
        .input('senha', mssql.VarChar(30), senha)
        .query(`
          UPDATE ${dbTable}
          SET passwd = @senha
          OUTPUT INSERTED.account
          WHERE email = @email
        `);

      // Extrair o nome da conta do resultado
      if (result.recordset.length > 0) {
        accountName = result.recordset[0].account;
      }
    });
   
    // Remover o email do cache
    cacheStorage.del(email);

    res.status(200).json({ success: `<strong>${accountName}</strong> password changed successfully`, redirect: '/' });

  } catch (err) {
    console.error('Error changing password:', err.message);
    res.status(500).json({ error: 'internal server error' });
  } finally {
    // Sempre liberar a conexão, mesmo se ocorrer um erro
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;