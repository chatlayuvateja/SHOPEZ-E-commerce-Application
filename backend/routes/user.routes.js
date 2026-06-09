const express = require('express');
const router = express.Router();

const placeholder = (req, res) => {
  res.status(200).json({ message: 'User route - not yet implemented' });
};

router.get('/', placeholder);

module.exports = router;
