const crypto = require('crypto');

// Função para gerar um token
function generateToken() {
    const length = 64; // Comprimento do token
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Caracteres possíveis no token
    let token = '';

    // Gera bytes criptograficamente seguros
    const bytes = crypto.randomBytes(length);

    for (let i = 0; i < bytes.length; i++) {
        const index = bytes[i] % chars.length;
        token += chars.charAt(index);
    }

    return token;
}

module.exports = { generateToken };