require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');              // ← NEW
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');             // ← NEW
const adminRouter = require('./routes/admin');           // ← NEW

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session (COOKIE alapú)
app.use(session({
    secret: process.env.SESSION_SECRET || 'devsecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 óra
}));

// a felhasználó elérhető legyen EJS-ben: user
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// útvonalak
app.use('/', indexRouter);
app.use('/', authRouter);      // /login, /register, /logout
app.use('/admin', adminRouter);// /admin (védett)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ NetPizza fut: http://localhost:${PORT}`));

module.exports = app;
