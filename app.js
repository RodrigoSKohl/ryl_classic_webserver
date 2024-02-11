//IMPORTS
//lib do server
const express = require('express');
//lib do https para usar certificado SSL
const https = require('https');
//lib para ler e gravar arquivos
const fs = require('fs');
//lib para ler caminhos
const path = require('path');
require('dotenv').config();
//lib das sessoes
const session = require('express-session');
//lib de geracao de HASH(por enquanto somente usado para o express session)
const crypto = require('crypto');

// Configurações do SSL
const sslOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'certificate', 'server-key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'certificate', 'server-cert.pem'))
};

//Setup Express
const localport = process.env.LOCAL_PORT
const port = process.env.HTTPS_PORT;
const localhost = process.env.LOCAL_HOST;
const app = express();
//inicializar o sessionkey
const sessionkey = crypto.randomBytes(32).toString('hex');
app.use(session({ secret: sessionkey, resave: false, saveUninitialized: true }));
//tratar JSON
app.use(express.json());
//Engine Static
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');


//lib do cors
const corsMiddleware = require('./middlewares/corsMiddleware');
//lib limitador
const limiter = require('./middlewares/limiter');
//lib csrf
const csrfProtect = require('./middlewares/csrfProtect');

//ROTAS//
//rota register
const register = require('./routes/register');
const registerAPI = require('./routes/api/register'); // Importe a rota de registro
app.use('/', corsMiddleware, csrfProtect, limiter, register, registerAPI);


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
