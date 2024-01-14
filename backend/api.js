const express = require('express');
const cors = require('cors');
const mssql = require('mssql');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;
const hcaptchaSecretKey = process.env.CAPTCHA_SECRET_KEY;

// Configurações de conexão com o banco de dados
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,  // Caso esteja usando criptografia (SSL/TLS)
    trustServerCertificate: true,  // Desabilitar a validação do certificado
  },
};

// Nome da tabela a partir da variável de ambiente
const dbTable = process.env.DB_TABLE;

// Middleware CORS
const corsOptions = {
  origin: '*',//host,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204, // alguns navegadores 204 não interpretam como erro
};

app.use(cors(corsOptions)); 

// Middleware para interpretar JSON
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Bem-vindo à minha aplicação!');
});



// Rota para criar um novo usuário
app.post('/registrar', async (req, res) => {
  try {
    const { username, senha, confirmarSenha, email, hcaptchaToken } = req.body;

    // Validar o hCaptcha
    const isHcaptchaValid = await validateHcaptcha(hcaptchaToken);
    if (!isHcaptchaValid) {
      return res.status(400).send('Falha na verificação hCaptcha.');
    }    

    // Validar o formato do username
    if (!/^[a-zA-Z0-9]{1,10}$/.test(username)) {
      return res.status(400).send('Formato inválido para o username.');
    }

    // Verificar se o username já existe no banco de dados
    const existingUser = await checkExistingUser(username);
    if (existingUser) {
      return res.status(400).send('Username já está em uso.');
    }

    // Validar a senha
    if (senha.length < 6) {
      return res.status(400).send('A senha deve ter pelo menos 6 caracteres.');
    }

    // Confirmar se as senhas são iguais
    if (senha !== confirmarSenha) {
      return res.status(400).send('As senhas não coincidem.');
    }

    // Validar o formato do email
    if (!email.includes('@')) {
      return res.status(400).send('Formato inválido para o email.');
    }

    // Verificar se o email já existe no banco de dados
    const existingEmail = await checkExistingEmail(email);
    if (existingEmail) {
      return res.status(400).send('Email já está em uso.');
    }

    // Conectar ao banco de dados
    const pool = await mssql.connect(dbConfig);

    // Inserir usuário, senha e email na tabela usando consulta parametrizada
    const result = await pool.request()
      .input('username', mssql.VarChar(12), username)
      .input('senha', mssql.VarChar(30), senha)
      .input('email', mssql.VarChar(50), email)
      .query(`
        INSERT INTO ${dbTable} (account, passwd, email)
        VALUES (@username, @senha, @email)
      `);

    // Imprimir os resultados
    console.dir(result);

    res.status(201).send('Usuário criado com sucesso.');
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).send('Erro interno do servidor.');
  } finally {
    // Fechar a conexão
    await mssql.close();
  }
});

// Função para validar o hCaptcha
async function validateHcaptcha(token) {
  const response = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${hcaptchaSecretKey}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
}

// Função para verificar se o username já existe no banco de dados
async function checkExistingUser(username) {
  const pool = await mssql.connect(dbConfig);
  const result = await pool.request()
    .input('username', mssql.VarChar(12), username)
    .query(`
      SELECT TOP 1 1
      FROM ${dbTable}
      WHERE account = @username
    `);

  return result.recordset.length > 0;
}

// Função para verificar se o email já existe no banco de dados
async function checkExistingEmail(email) {
  const pool = await mssql.connect(dbConfig);
  const result = await pool.request()
    .input('email', mssql.VarChar(50), email)
    .query(`
      SELECT TOP 1 1
      FROM ${dbTable}
      WHERE email = @email
    `);

  return result.recordset.length > 0;
}

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em ${host}:${port}`);
});