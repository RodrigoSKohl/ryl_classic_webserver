const express = require('express');
const router = express.Router();
const { pool, mssql } = require('../../models/connect');
const {
    checkExistingUser,
    checkExistingPassword
} = require('../../models/dbFunctions');
const validateHcaptchaMiddleware = require('../../middlewares/hcaptchaMiddleware');
const cacheStorage = require('../../utils/cache.js'); // Importe a instância de cache
const dbTable = process.env.DB_TABLE; // Nome da tabela a partir da variável de ambiente
const { generateToken } = require('../../utils/token.js');	// Importe a função de geração de token



const tokenExp = 172800; // tempo do token em segundos (48 horas)

router.post('/api/login', validateHcaptchaMiddleware, async (req, res) => {
    let connection;

    try {
        const { username, senha } = req.body;

        // Conectar ao banco de dados utilizando a instância única de pool
        connection = await pool.connect();

        // Array de erros
        const errors = [];

        // Verificar se o username existe no banco de dados
        const existingUser = await checkExistingUser(username, connection, mssql, dbTable);
        if (!existingUser) {
            errors.push('username invalid');
        }

        // Verificar se a senha está correta
        const matchPassword = await checkExistingPassword(senha, connection, mssql, dbTable);
        if (!matchPassword) {
            errors.push('password invalid');
        }

        // Se houver erros, retornar uma resposta com status 400
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Gerar um token único
        const token = generateToken();

        // Armazenar os dados do usuário na cache com um tempo de expiração
        cacheStorage.set(username, { username, token }, tokenExp); // Converter para milissegundos

        // Enviar o token JWT para o cliente
        return res.status(200).json({ token, success: 'Login successful.' });

    } catch (err) {
        console.error('Error on Login:', err.message);
        res.status(500).json({ error: 'internal server error' });
    } finally {
        // Sempre liberar a conexão, mesmo se ocorrer um erro
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;