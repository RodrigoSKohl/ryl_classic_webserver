// login.js
const express = require('express');
const router = express.Router();

router.get('/login',  (req, res) => {
  // Generate a token and send it to the view
  res.render('login', {currentPage: 'login', csrfToken: req.csrfToken() });
});

module.exports = router;