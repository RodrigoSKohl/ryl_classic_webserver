// forgotPassword.js
const express = require('express');
const router = express.Router();

router.get('/forgot-password',  (req, res) => {
  // Generate a token and send it to the view
  res.render('forgot-password', {currentPage: 'forgot-password', csrfToken: req.csrfToken() });
});

module.exports = router;