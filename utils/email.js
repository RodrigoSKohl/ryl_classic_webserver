// utils/email.js

async function sendConfirmationEmail(email, confirmationURL) {
    try {
      //  biblioteca de e-mail como nodemailer
      const nodemailer = require('nodemailer');
  
      // Configurações de transporte de e-mail (substitua com suas próprias configurações)
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER, // email address
          pass: process.env.EMAIL_PASS // email password
        }
      });
  
      // Conteúdo do e-mail
      const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: email, // list of receivers
        subject: 'Ryl Classic Email Confirmation', // Subject line
        text: `Please click on the following link to confirm your email: ${confirmationURL}`, // plain text body
        html: `<p><a href="${confirmationURL}">Please click here to confirm your email</a></p>` // html body
      };
  
      // Enviar o e-mail
      const info = await transporter.sendMail(mailOptions);
  
      console.log('Email sent: ', info.messageId);
    } catch (error) {
      console.error('Error sending confirmation email:', error.message);
      throw error; // Re-throw o erro para que ele possa ser tratado no ponto de chamada
    }
  }
  
  module.exports = { sendConfirmationEmail };