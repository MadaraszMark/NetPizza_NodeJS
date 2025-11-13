const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // adatbázis kapcsolat
const bcrypt = require("bcrypt");

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

  const success = req.session.success || null;
  const error = req.session.error || null;

  req.session.success = null;
  req.session.error = null;

  res.render('pages/contact', {
    user: req.session.user || null,
    success,
    error,
    errors: [],
    nev: "",
    email: "",
    targy: "",
    uzenet: ""
  });
});

router.post('/contact', async (req, res) => {
  const { nev, email, targy, uzenet } = req.body;

  let errors = [];

  if (!nev || nev.length < 3) errors.push("A név legalább 3 karakter legyen.");
  if (!email || !email.includes("@")) errors.push("Érvényes email címet adj meg.");
  if (!uzenet || uzenet.length < 5) errors.push("Az üzenet legalább 5 karakter legyen.");

  if (errors.length > 0) {
    return res.render("pages/contact", {
      user: req.session.user || null,
      errors,
      nev,
      email,
      targy,
      uzenet
    });
  }

  try {
    let user = req.session.user;

    const cleanEmail = email.trim().toLowerCase();   // <<<<<<<<<<< FONTOS

    if (!user) {
      const [existing] = await pool.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [cleanEmail]
      );

      if (existing.length === 0) {

        const username = "guest" + Math.floor(1000 + Math.random() * 9000);
        const hashedPassword = await bcrypt.hash("vendeg123", 10);

        const [insert] = await pool.query(
          `INSERT INTO users 
             (username, email, password_hash, role, is_active, last_login, created_at, updated_at)
           VALUES (?, ?, ?, 'guest', 1, NOW(), NOW(), NOW())`,
          [username, cleanEmail, hashedPassword]
        );

        user = {
          id: insert.insertId,
          username,
          email: cleanEmail,
          role: "guest"
        };

      } else {
        user = existing[0];

        await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
          user.id
        ]);
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,     // <<<<<< már normalizált
        role: user.role
      };
    }

    await pool.query(
      "INSERT INTO uzenetek (nev, email, targy, uzenet) VALUES (?, ?, ?, ?)",
      [nev, cleanEmail, targy, uzenet]
    );

    req.session.success = "Köszönjük! Üzeneted sikeresen elküldtük. 📩";
    return res.redirect("/contact");

  } catch (err) {
    console.error("❌ Üzenet mentési hiba:", err);
    req.session.error = "Hiba történt az üzenet mentésekor.";
    return res.redirect("/contact");
  }
});


// --- RÓLUNK ---
router.get('/about', (req, res) => {
  res.render('pages/about', { user: req.session.user || null });
});

// --- SZOLGÁLTATÁSOK ---
router.get('/services', (req, res) => {
  res.render('pages/services', { user: req.session.user || null });
});

router.get('/messages', async (req, res) => {

  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    let messages;

    if (req.session.user.role === "admin") {
      // 🔥 Admin minden üzenetet lát
      [messages] = await pool.query(
        "SELECT * FROM uzenetek ORDER BY created_at DESC"
      );

    } else {

      // 🔥 Normál user / guest: csak a SAJÁT emailje alapján
      const userEmail = req.session.user.email
        ? req.session.user.email.trim().toLowerCase()
        : null;

      if (!userEmail) {
        return res.render("pages/messages", {
          user: req.session.user,
          messages: [],
          error: "Nincs email a felhasználói profilhoz társítva."
        });
      }

      [messages] = await pool.query(
        `SELECT * FROM uzenetek 
         WHERE LOWER(TRIM(email)) = ? 
         ORDER BY created_at DESC`,
        [userEmail]
      );
    }

    res.render('pages/messages', {
      user: req.session.user,
      messages
    });

  } catch (err) {
    console.error("❌ Üzenetek lekérdezési hiba:", err);
    res.status(500).send("Szerver hiba az üzenetek lekérésekor.");
  }

});




// --- BLOG CIKK ---
router.get('/blog-single', (req, res) => {
  res.render('pages/blog-single', { user: req.session.user || null });
});

module.exports = router;
