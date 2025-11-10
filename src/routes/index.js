const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // ← importáljuk az adatbázist

// Főoldal
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pizza');
    res.render('pages/index', { pizzas: rows });
  } catch (err) {
    console.error('❌ Adatbázis hiba:', err);
    res.status(500).send('Adatbázis kapcsolat hiba');
  }
});

module.exports = router;

// Menü oldal
router.get('/menu', (req, res) => {
  res.render('pages/menu');
});

// Kapcsolat oldal
router.get('/contact', (req, res) => {
  res.render('pages/contact');
});

// Rólunk oldal
router.get('/about', (req, res) => {
  res.render('pages/about');
});

// Szolgáltatások
router.get('/services', (req, res) => {
  res.render('pages/services');
});

// Blog
router.get('/blog', (req, res) => {
  res.render('pages/blog');
});

// Blog cikk
router.get('/blog-single', (req, res) => {
  res.render('pages/blog-single');
});

module.exports = router;

