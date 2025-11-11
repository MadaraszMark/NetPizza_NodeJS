const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // adatbázis kapcsolat

// --- FŐOLDAL ---
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pizza');
    res.render('pages/index', { pizzas: rows, user: req.session.user || null });
  } catch (err) {
    console.error('❌ Adatbázis hiba:', err);
    res.status(500).send('Adatbázis kapcsolat hiba');
  }
});

// --- MENÜ (3 tábla adatai) ---
router.get('/menu', async (req, res) => {
  try {
    const [pizzak] = await pool.query('SELECT * FROM pizza');
    const [kategoriak] = await pool.query('SELECT * FROM kategoria');
    const [rendelesek] = await pool.query('SELECT * FROM rendeles');

    res.render('pages/menu', {
      user: req.session.user || null,
      pizzak,
      kategoriak,
      rendelesek
    });
  } catch (err) {
    console.error('❌ Menü lekérdezési hiba:', err);
    res.status(500).send('Szerver hiba a menü oldal betöltésekor.');
  }
});

// --- KAPCSOLAT ---
router.get('/contact', (req, res) => {
  res.render('pages/contact', { user: req.session.user || null });
});

// --- RÓLUNK ---
router.get('/about', (req, res) => {
  res.render('pages/about', { user: req.session.user || null });
});

// --- SZOLGÁLTATÁSOK ---
router.get('/services', (req, res) => {
  res.render('pages/services', { user: req.session.user || null });
});

// --- Üzenetek ---
router.get('/messages', (req, res) => {
  res.render('pages/messages', { user: req.session.user || null });
});

// --- BLOG CIKK ---
router.get('/blog-single', (req, res) => {
  res.render('pages/blog-single', { user: req.session.user || null });
});

module.exports = router;
