// middlewares/csrfProtect.js
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const csrfProtect = csrf({ cookie: true });

module.exports = [cookieParser(), csrfProtect];