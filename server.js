const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app');

// Configurações do SSL
if (process.env.LOCAL_DEV === 'true') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

const sslKeyPath = path.resolve(__dirname, 'certificate', 'server-key.pem');
const sslCertPath = path.resolve(__dirname, 'certificate', 'server-cert.pem');
const sslPasswordPath = path.resolve(__dirname, 'certificate', 'ssl_password.txt');

// Lendo a senha do arquivo
const sslPassword = fs.readFileSync(sslPasswordPath, 'utf8').trim();

const sslOptions = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath),
  passphrase: sslPassword,
  rejectUnauthorized: process.env.LOCAL_DEV !== 'true'
};

const port = process.env.HTTPS_PORT;
const host = process.env.HOST;

// Crie o servidor HTTPS usando o Express
const server = https.createServer(sslOptions, app);

// Inicie o servidor HTTPS
server.listen(port, host, () => {
  console.log(`Servidor Express rodando em ${host} na porta ${port}`);
});
