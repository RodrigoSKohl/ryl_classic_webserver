// routes/register.js
const express = require('express');
const { pool, mssql } = require('../../models/connect');
const router = express.Router();
const {
  checkExistingUser,
  checkExistingEmail,
} = require('../../models/dbFunctions'); // Importe as funções de verificação do banco de dados
const validator = require('validator');
const  validateHcaptchaMiddleware  = require('../../middlewares/hcaptchaMiddleware');
const dbTable = process.env.DB_TABLE; // Nome da tabela a partir da variável de ambiente

router.post('/api/register',  async (req, res) => {
  let connection;

  try {
    const { username, senha, confirmarSenha, email } = req.body;

    // Conectar ao banco de dados utilizando a instância única de pool
    connection = await pool.connect();

    // Array de erros
    const errors = [];

    // Validar o formato do username
    if (!validator.isAlphanumeric(username)) {
      errors.push('Formato inválido para o username.');
    }

    // Verificar se o username já existe no banco de dados
    const existingUser = await checkExistingUser(username, connection, mssql, dbTable);
    if (existingUser) {
      errors.push('Username já está em uso.');
    }

    // Validar a senha
    if (senha.length < 6) {
      errors.push('A senha deve ter pelo menos 6 caracteres.');
    }

    // Confirmar se as senhas são iguais
    if (senha !== confirmarSenha) {
      errors.push('As senhas não coincidem.');
    }

    // Validar o formato do email
    if (!validator.isEmail(email)) {
      errors.push('Formato inválido para o email.');
    }

    // Verificar se o email já existe no banco de dados
    const existingEmail = await checkExistingEmail(email, connection, mssql, dbTable);
    if (existingEmail) {
      errors.push('Email já está em uso.');
    }

    // Verificar se há erros e retornar o status adequado
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Chamar o middleware do hCaptcha
    validateHcaptchaMiddleware(req, res, async () => {});

    // Inserir usuário, senha e email na tabela usando consulta parametrizada
    const result = await connection.request()
      .input('username', mssql.VarChar(12), username)
      .input('senha', mssql.VarChar(30), senha)
      .input('email', mssql.VarChar(50), email)
      .query(`
        INSERT INTO ${dbTable} (account, passwd, email)
        OUTPUT Inserted.account, Inserted.email
        VALUES (@username, @senha, @email)
      `);

    // Imprimir os resultados
    if (result.rowsAffected && result.rowsAffected[0] === 1) {
      const createdUser = result.recordset[0];

      // Logar no console
      console.log('Usuário criado com sucesso:');
      console.log('Username:', createdUser.account);
      console.log('Email:', createdUser.email);

      res.status(201).json({ success: 'Usuário registrado com sucesso!', user: createdUser });
    } else {
      console.error('Erro ao criar usuário: Nenhuma linha afetada pela inserção.');
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  } finally {
    // Sempre libere a conexão, mesmo se ocorrer um erro
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;