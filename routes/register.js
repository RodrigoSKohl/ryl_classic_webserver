// register.js
const express = require('express');
const router = express.Router();

router.get('/register',  (req, res) => {
  // Generate a token and send it to the view
  res.render('register', {currentPage: 'register', csrfToken: req.csrfToken() });
});

module.exports = router;