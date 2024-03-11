require('dotenv').config({path:'C:/site/.env'})
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');

// Configurações do SSL
if (process.env.LOCAL_DEV === 'true') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'certificate', 'server-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'certificate', 'server-cert.pem')),
  passphrase: process.env.DB_PASSWORD, 
  rejectUnauthorized: process.env.LOCAL_DEV !== 'true'
};

//Setup Express
const localport = process.env.LOCAL_PORT;
const port = process.env.HTTPS_PORT;
const localhost = process.env.LOCAL_HOST;

//custom conf libs
const corsMiddleware = require('./middlewares/corsMiddleware');
const limiter = require('./middlewares/limiter');
const csrfProtect = require('./middlewares/csrfProtect');
const checkRegisterAccessMiddleware = require('./middlewares/checkRegisterAccessMiddleware');
const blockDirectIPAccess = require('./middlewares/blockDirectIPAccess');

//start express
const app = express();
const sessionkey = crypto.randomBytes(32).toString('hex');
app.use(session({ secret: sessionkey, resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', true);
app.set('view engine', 'ejs');




//ROTAS//
const index = require('./routes/index');
const register = require('./routes/register');
const registerAPI = require('./routes/api/register');
//middlewaress globais
app.use(blockDirectIPAccess, limiter, corsMiddleware)
//rota index
app.use('/' ,index);
//rota de registro
app.use('/', csrfProtect, register, checkRegisterAccessMiddleware, registerAPI);

// Iniciar o servidor local
app.listen(localport, localhost, () => {
  console.log(`Servidor rodando localmente em ${localhost}:${localport}`);
});

// Crie o servidor HTTPS usando o Express
const server = https.createServer(sslOptions, app);
// Inicie o servidor HTTPS
server.listen(port, () => {
  console.log(`Servidor Express rodando em todas interfaces de rede em HTTPS na porta ${port}`);
});