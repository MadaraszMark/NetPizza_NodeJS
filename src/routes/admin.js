const express = require('express');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// csak admin
router.get('/', requireRole('admin'), (req, res) => {
    res.render('admin/index'); // egyszerű admin főoldal
});

module.exports = router;
