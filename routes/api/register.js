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




router.post('/api/register', validateHcaptchaMiddleware,  async (req, res) => {
  let connection;

  try {
    const { username, senha, confirmarSenha, email } = req.body;

    // Conectar ao banco de dados utilizando a instância única de pool
    connection = await pool.connect();

    // Array de erros
    const errors = [];


    // Validar a senha
    if (senha.length < 6) {
      errors.push('password must be at least 6 characters');
    }

    // Confirmar se as senhas são iguais
    if (senha !== confirmarSenha) {
      errors.push('passwords not match');
    }

    // Validar o formato do username
    if (!validator.isAlphanumeric(username)) {
      errors.push('invalid username format');
    }

    // Validar o formato do email
    if (!validator.isEmail(email)) {
      errors.push('invali email format');
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

    // Verificar se há erros e retornar o status adequado
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }


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
      console.log('Usuario criado com sucesso');
      console.log('Username:', createdUser.account);
      console.log('Email:', createdUser.email);

        // Resetar a validação do hCaptcha na sessão
      req.session.hcaptchaValidated = false;

      res.status(201).json({ success: 'successfully registered user', user: createdUser });
    } else {
      console.error('Erro ao criar usuário: Nenhuma linha afetada pela inserção.');
      res.status(500).json({ error: 'internal server error' });
    }
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).json({ error: 'interval server error' });
  } finally {
    // Sempre libere a conexão, mesmo se ocorrer um erro
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;