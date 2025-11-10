require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// útvonalak
app.use('/', indexRouter);

// szerver indítása
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ NetPizza fut: http://localhost:${PORT}`));

module.exports = app;

