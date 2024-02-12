const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
require('dotenv').config();

// Configurações do SSL
if (process.env.LOCAL_DEV === 'true') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'certificate', 'server-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'certificate', 'server-cert.pem')),
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

//start express
const app = express();
const sessionkey = crypto.randomBytes(32).toString('hex');
app.use(session({ secret: sessionkey, resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');




//ROTAS//
const register = require('./routes/register');
const registerAPI = require('./routes/api/register');
//rota de registro
app.use('/', limiter, corsMiddleware, csrfProtect, register, checkRegisterAccessMiddleware, registerAPI);

// Iniciar o servidor local
app.listen(localport, () => {
  console.log(`Servidor rodando localmente em ${localhost}:${localport}`);
});

// Crie o servidor HTTPS usando o Express
const server = https.createServer(sslOptions, app);
// Inicie o servidor HTTPS
server.listen(port, () => {
  console.log(`Servidor Express rodando em todas interfaces de rede em HTTPS na porta ${port}`);
});