const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');

const router = express.Router();

// REGISZTRÁCIÓ (GET)
router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', { message: null, error: null }); // mindig adunk változókat
});

// REGISZTRÁCIÓ (POST)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).render('auth/register', { message: null, error: 'Minden mező kötelező!' });
        }

        if (password !== confirmPassword) {
            return res.status(400).render('auth/register', { message: null, error: 'A jelszavak nem egyeznek!' });
        }

        // egyediség ellenőrzése
        const [u1] = await pool.query('SELECT id FROM users WHERE username=? OR email=?', [username, email]);
        if (u1.length > 0) {
            return res.status(400).render('auth/register', { message: null, error: 'Felhasználónév vagy e-mail már foglalt.' });
        }

        const hash = await bcrypt.hash(password, 12);

        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?,?,?,?,1)',
            [username, email, hash, 'user']
        );

        // 🔹 Session-be mentjük a felhasználót
        req.session.user = {
            id: result.insertId,
            username,
            email,
            role: 'user',
        };

        // 🔹 Sikeres regisztráció – visszajelzés EJS-nek
        res.render('auth/register', {
            message: '🎉 Sikeres regisztráció! 2 másodpercen belül a főoldalra irányítunk...',
            error: null
        });

    } catch (err) {
        console.error('Hiba a regisztráció során:', err);
        res.status(500).render('auth/register', { message: null, error: 'Szerver hiba történt.' });
    }
});

// BEJELENTKEZÉS (GET)
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { error: null });
});

// BEJELENTKEZÉS (POST)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // <--- FONTOS! "identifier" helyett "email"

        // keresés username vagy email alapján
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username=? OR email=? LIMIT 1',
            [email, email]
        );

        if (rows.length === 0) {
            return res.status(400).render('auth/login', { error: '❌ Hibás e-mail cím vagy jelszó.' });
        }

        const user = rows[0];
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(400).render('auth/login', { error: '❌ Hibás e-mail cím vagy jelszó.' });
        }

        if (!user.is_active) {
            return res.status(403).render('auth/login', { error: '⚠️ A fiók inaktív.' });
        }

        // mentjük sessionbe
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // sikeres bejelentkezés
        return res.redirect('/');

    } catch (err) {
        console.error('Bejelentkezési hiba:', err);
        res.status(500).render('auth/login', { error: 'Szerver hiba történt.' });
    }
});


// KIJELENTKEZÉS
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;
