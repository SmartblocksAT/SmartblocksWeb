const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const chalk = require('chalk');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();


// const loggerConfig = logger(function (tokens, req, res) {
//     return [
//         tokens.method(req, res),
//         tokens.url(req, res),
//         tokens.status(req, res),
//         tokens.res(req, res, 'content-length'), '-',
//         tokens['response-time'](req, res), 'ms'
//     ].join(' ')
// })


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

var compression = require('compression');
app.use(compression());
// app.use(logger('dev'));
app.use(logger('":method :url HTTP/:http-version" :status ":user-agent" :req[header]'));
// app.use(logger(loggerConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html', 'htm'],
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;


function headersSent(res) {
    return typeof res.headersSent !== 'boolean'
        ? Boolean(res._header)
        : res.headersSent
}
