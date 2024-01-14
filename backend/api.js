const express = require('express');
const cors = require('cors');
const mssql = require('mssql');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

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
    const { nome, senha, email } = req.body;

    // Conectar ao banco de dados
    const pool = await mssql.connect(dbConfig);

    // Inserir usuário, senha e email na tabela usando consulta parametrizada
    const result = await pool.request()
      .input('nome', mssql.VarChar(50), nome)
      .input('senha', mssql.VarChar(30), senha)
      .input('email', mssql.VarChar(50), email)
      .query(`
        INSERT INTO ${dbTable} (account, passwd, email)
        VALUES (@nome, @senha, @email)
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

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em ${host}:${port}`);
});