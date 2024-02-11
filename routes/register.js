// register.js
const express = require('express');
const router = express.Router();

router.get('/',  (req, res) => {
  // Generate a token and send it to the view
  res.render('register', { csrfToken: req.csrfToken() });
});

module.exports = router;