//lib do server
const express = require('express');
//lib do cors
const cors = require('cors');
//lib do sqlexpress
const mssql = require('mssql');
//lib do validador de email e usuario
const validator = require('validator');
//lib do https para usar certificado SSL
const https = require('https');
//lib para ler e gravar arquivos
const fs = require('fs');
//lib para ler caminhos
const path = require('path');
//lib para gravar logs
const morgan = require('morgan');
//variaveis de ambiente(mudar em .env )
require('dotenv').config();


const app = express();
const localport = process.env.LOCAL_PORT
const port = process.env.HTTPS_PORT;
const localhost = process.env.LOCAL_HOST;
const hcaptchaSecretKey = process.env.CAPTCHA_SECRET_KEY;
const hcaptchasite = process.env.HCAPTCHA_SITE;
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');


// Configurações do SSL
const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'server-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'server-cert.pem'))
};

// Configurações de conexão com o banco de dados
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,  // Caso esteja usando criptografia (SSL/TLS)
    trustServerCertificate: true,  // Desabilitar a validação do certificado
  },
};

// Nome da tabela a partir da variável de ambiente
const dbTable = process.env.DB_TABLE;

// Crie um stream de gravação para salvar os logs em um arquivo
const logStream = fs.createWriteStream('logs.txt', { flags: 'a' });
// Middleware Morgan para gerar logs HTTP e direcioná-los para o stream de gravação
app.use(morgan('combined', { stream: logStream }));


// Middleware CORS
const allOrigins = [...allowedOrigins, ...localhost]; //add outras origens em env caso utilizar, por padrao add locoalhost na array
const corsOptions = {
  origin: allOrigins, 
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type',
  optionsSuccessStatus: 204, // alguns navegadores 204 não interpretam como erro
};

app.use(cors(corsOptions)); 

// Middleware para interpretar JSON
app.use(express.json());

// Criar uma única instância de pool de conexão para ser reutilizada
const pool = new mssql.ConnectionPool(dbConfig);

app.get('/', (_, res) => {
  res.send('API ONLINE');
});


// Rota para criar um novo usuário
app.post('/registrar', async (req, res) => {
  let connection;

  try {
    const { username, senha, confirmarSenha, email, hcaptchaToken } = req.body;

    // Conectar ao banco de dados utilizando a instância única de pool
    connection = await pool.connect();

    // Validar o formato do username
    if (!validator.isAlphanumeric(username)) {
      return res.status(400).send('Formato inválido para o username.');
    }

    // Verificar se o username já existe no banco de dados
    const existingUser = await checkExistingUser(username, connection);
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
    if (!validator.isEmail(email)) {
      return res.status(400).send('Formato inválido para o email.');
    }

    // Verificar se o email já existe no banco de dados
    const existingEmail = await checkExistingEmail(email, connection);
    if (existingEmail) {
      return res.status(400).send('Email já está em uso.');
    }

    // Validar o hCaptcha
    const isHcaptchaValid = await validateHcaptcha(hcaptchaToken);
    if (!isHcaptchaValid) {
      return res.status(400).send('Falha na verificação hCaptcha.');
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
  console.log('Usuário criado com sucesso:');
  console.log('Username:', createdUser.account);
  console.log('Email:', createdUser.email);

  res.status(201).send(`Usuário registrado com sucesso!\n\nUsername: ${createdUser.account}\nEmail: ${createdUser.email}`);
} else {
  console.error('Erro ao criar usuário: Nenhuma linha afetada pela inserção.');
  res.status(500).send('Erro interno do servidor.');
}
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).send('Erro interno do servidor.');
  } finally {
    // Sempre libere a conexão, mesmo se ocorrer um erro
    if (connection) {
      connection.release();
    }
  }
});

// Função para validar o hCaptcha
async function validateHcaptcha(token) {
  const response = await fetch(hcaptchasite, {
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
async function checkExistingUser(username, pool) {
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
async function checkExistingEmail(email, pool) {
  const result = await pool.request()
    .input('email', mssql.VarChar(50), email)
    .query(`
      SELECT TOP 1 1
      FROM ${dbTable}
      WHERE email = @email
    `);

  return result.recordset.length > 0;
}


// Crie o servidor HTTPS usando o Express
const server = https.createServer(sslOptions, app);

// Iniciar o servidor local - para testes
//Utilze NKGROK OU LOCALTUNNEL para acessar pelo host local publicamente
app.listen(localport, localhost, () => {
  console.log(`Servidor rodando localmente em ${localhost}:${localport}`);
});


//FORÇA ACEITAR CERTIFICADO NAO VERIFICADO, NÃO UTILIZAR EM PRODUCAO
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// Inicie o servidor HTTPS
server.listen(port, () => {
  console.log(`Servidor Express rodando em todas interfaces de rede em HTTPS na porta ${port}`);
});
