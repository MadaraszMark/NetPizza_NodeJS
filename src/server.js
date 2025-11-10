const express = require("express");
const mysql = require("mysql2/promise"); // FIGYELEM: promise verzió kell a pool-hoz
const session = require("express-session");
const path = require("path");

const app = express();

// --- Beállítások ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// --- Session kezelés ---
app.use(session({
    secret: "netpizza_secret_key",
    resave: false,
    saveUninitialized: false
}));

// --- Saját pool modul ---
const pool = require("./db/pool");

// --- Middleware: user info navbarhoz ---
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// --- Auth route betöltése ---
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

// --- Kezdőlap ---
app.get("/", (req, res) => {
    res.render("index", { user: req.session.user || null });
});

// --- Szerver indítása ---
app.listen(3000, () => {
    console.log("🌐 NetPizza fut: http://localhost:3000");
});
