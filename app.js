require('dotenv').config();
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const { downloadURL, discordInvite, patchURL } = require('./utils/constants');

// Setup Express
const app = express();
const sessionkey = crypto.randomBytes(32).toString('hex');
app.use(session({ secret: sessionkey, resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', true);
app.locals.downloadURL = downloadURL;
app.locals.discordInvite = discordInvite;
app.locals.patchURL = patchURL;
app.set('view engine', 'ejs');
app.set('layout', 'layout');
app.use(expressLayouts);

// Rotas
const index = require('./routes/index');
const register = require('./routes/register');
const registerAPI = require('./routes/api/register');
const confirmEmail = require('./routes/confirmEmail');
const forgotPassword = require('./routes/forgotPassword');
const forgotPasswordAPI = require('./routes/api/forgotPassword');
const changePassword = require('./routes/changePassword');
const changePasswordAPI = require('./routes/api/changePassword');
const login = require('./routes/login');
const loginAPI = require('./routes/api/login');
const corsMiddleware = require('./middlewares/corsMiddleware');
const limiter = require('./middlewares/limiter');
const csrfProtect = require('./middlewares/csrfProtect');

app.use(limiter, corsMiddleware);
app.use('/', index);
app.use('/',csrfProtect, login, loginAPI);
app.use('/', csrfProtect, register, registerAPI);
app.use('/', confirmEmail);
app.use('/', csrfProtect, forgotPassword, forgotPasswordAPI);
app.use('/', csrfProtect, changePassword, changePasswordAPI);

module.exports = app;