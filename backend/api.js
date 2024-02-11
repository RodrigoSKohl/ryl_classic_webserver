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
//lib dos cookies
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
//variaveis de ambiente(mudar em .env )
require('dotenv').config();

//Setup Express
const app = express();
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));
// Set up view engine
app.set('view engine', 'ejs');
const localport = process.env.LOCAL_PORT
const port = process.env.HTTPS_PORT;
const localhost = process.env.LOCAL_HOST;
//Variaveis do SK do Captcha e Site
const hcaptchaSecretKey = process.env.CAPTCHA_SECRET_KEY;
const hcaptchasite = process.env.HCAPTCHA_SITE;
// Origens do CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
// Nome da tabela a partir da variável de ambiente
const dbTable = process.env.DB_TABLE;


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

// Criar uma única instância de pool de conexão para ser reutilizada
const pool = new mssql.ConnectionPool(dbConfig);


// Middlewares csrf
app.use(cookieParser()); // Add cookie parser middleware
const csrfProtect = csrf({ cookie: true }); //CSRF protection confs
app.use(express.urlencoded({ extended: false })); // 'application/x-www-form-urlencoded'


// Middleware CORS
const corsOptions = {
  origin: allowedOrigins, 
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type',
  credentials: true,
  optionsSuccessStatus: 204, // alguns navegadores 204 não interpretam como erro
};
app.use(cors(corsOptions)); 


app.get('/register', csrfProtect, function(req, res) {
  // Generate a token and send it to the view
  res.render('register', { csrfToken: req.csrfToken() });
});

// Rota para criar um novo usuário

app.post('/api/register', csrfProtect, async (req, res) => {
  let connection;

  try {
    const { username, senha, confirmarSenha, email, 'h-captcha-response': hcaptchaToken } = req.body;

    // Validar o hCaptcha
    const isHcaptchaValid = await validateHcaptcha(hcaptchaToken);
    if (!isHcaptchaValid) {
      return res.status(400).json({ error: 'Falha na verificação hCaptcha.' });
    }


    // Conectar ao banco de dados utilizando a instância única de pool
    connection = await pool.connect();

    const errors = [];

    // Validar o formato do username
    if (!validator.isAlphanumeric(username)) {
      errors.push('Formato inválido para o username.');
    }
    
    // Verificar se o username já existe no banco de dados
    const existingUser = await checkExistingUser(username, connection);
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
    const existingEmail = await checkExistingEmail(email, connection);
    if (existingEmail) {
       errors.push('Email já está em uso.');
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
  console.log(data);
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
app.listen(localport,() => {
  console.log(`Servidor rodando localmente em ${localhost}:${localport}`);
});


//FORÇA ACEITAR CERTIFICADO NAO VERIFICADO, NÃO UTILIZAR EM PRODUCAO
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// Inicie o servidor HTTPS
server.listen(port, () => {
  console.log(`Servidor Express rodando em todas interfaces de rede em HTTPS na porta ${port}`);
});
