const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// ADMIN védelem
function isAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/login");
    }
    next();
}

// ADMIN PIZZA LISTA
router.get("/", isAdmin, async (req, res) => {
    try {
        const [pizzas] = await pool.query(`
    SELECT 
        pizza.nev,
        pizza.kep,
        pizza.kategorianev,
        pizza.vegetarianus,
        kategoria.ar
    FROM pizza
    LEFT JOIN kategoria 
        ON pizza.kategorianev = kategoria.nev
    ORDER BY pizza.nev
`);


        const [kategoriak] = await pool.query("SELECT nev FROM kategoria");

        res.render("admin/index", {
            user: req.session.user,
            pizzas,
            kategoriak
        });

    } catch (err) {
        console.error("❌ Admin lekérdezési hiba:", err);
        res.status(500).send("Admin hiba történt");
    }
});

// ÚJ PIZZA
router.post("/pizzak/uj", isAdmin, async (req, res) => {
    const { nev, kep, kategorianev, vegetarianus } = req.body;

    try {
        await pool.query(
            "INSERT INTO pizza (nev, kep, kategorianev, vegetarianus, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
            [nev, kep, kategorianev, vegetarianus]
        );

        res.redirect("/admin");
    } catch (err) {
        console.error("❌ Pizza létrehozási hiba:", err);
        res.status(500).send("Hiba létrehozáskor");
    }
});

// SZERKESZTÉS
router.post("/pizzak/szerkeszt", isAdmin, async (req, res) => {
    const { originalNev, nev, kep, kategorianev, vegetarianus } = req.body;

    try {
        await pool.query(
            "UPDATE pizza SET nev=?, kep=?, kategorianev=?, vegetarianus=?, updated_at=NOW() WHERE nev=?",
            [nev, kep, kategorianev, vegetarianus, originalNev]
        );

        res.redirect("/admin");
    } catch (err) {
        console.error("❌ Pizza szerkesztési hiba:", err);
        res.status(500).send("Hiba módosításkor");
    }
});

// TÖRLÉS
router.post("/pizzak/torol", isAdmin, async (req, res) => {
    const { nev } = req.body;

    try {
        await pool.query("DELETE FROM pizza WHERE nev=?", [nev]);
        res.redirect("/admin");
    } catch (err) {
        console.error("❌ Pizza törlési hiba:", err);
        res.status(500).send("Hiba törléskor");
    }
});

module.exports = router;
